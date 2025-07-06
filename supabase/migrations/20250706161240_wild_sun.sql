/*
  # Add Posts and Social Features

  1. New Tables
    - `posts` - User posts with voice/text content and persona types
    - `post_resonances` - Like/resonance system for posts
    - `post_comments` - Comments on posts (voice/text)
    - `follows` - User following system

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own content
    - Add policies for public reading of posts

  3. Storage
    - Create bucket for post audio files
    - Set up proper access policies
*/

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  audio_url text,
  persona_type text NOT NULL CHECK (persona_type IN ('roots', 'mask', 'spark')),
  authenticity_score numeric(5,2),
  resonance_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post resonances (like system)
CREATE TABLE IF NOT EXISTS post_resonances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- User follows
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add voice_bio_url to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'voice_bio_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN voice_bio_url text;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_resonances ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are publicly readable"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post resonances policies
CREATE POLICY "Resonances are publicly readable"
  ON post_resonances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create resonances"
  ON post_resonances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resonances"
  ON post_resonances
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Comments are publicly readable"
  ON post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON post_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are publicly readable"
  ON follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_persona_type ON posts(persona_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_resonances_post_id ON post_resonances(post_id);
CREATE INDEX IF NOT EXISTS idx_post_resonances_user_id ON post_resonances(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Add updated_at trigger to posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update resonance count
CREATE OR REPLACE FUNCTION update_post_resonance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET resonance_count = resonance_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET resonance_count = GREATEST(0, resonance_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for count updates
CREATE TRIGGER trigger_update_resonance_count
  AFTER INSERT OR DELETE ON post_resonances
  FOR EACH ROW
  EXECUTE FUNCTION update_post_resonance_count();

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Storage bucket for post audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-audio', 'post-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post audio
CREATE POLICY "Users can upload post audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post audio is publicly readable"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'post-audio');

CREATE POLICY "Users can update their own post audio"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);