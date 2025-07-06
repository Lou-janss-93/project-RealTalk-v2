/*
  # Initial Schema Setup for RealTalk Platform

  1. New Tables
    - `profiles` - User profiles with personality types and preferences
    - `matches` - Matching system for connecting users
    - `conversations` - Conversation records with metadata
    - `voice_profiles` - Voice authentication and analysis data
    - `feedback_events` - Real-time feedback events during conversations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for matches and conversations between matched users

  3. Storage
    - Create bucket for voice profiles
    - Set up proper access policies for audio files

  4. Functions
    - Add matching algorithm function
    - Add conversation analytics functions
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  personality_type text CHECK (personality_type IN ('real-me', 'my-mask', 'crazy-self')),
  bio text,
  preferences jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  match_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  UNIQUE(user1_id, user2_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration integer, -- in seconds
  avg_drift_level numeric(5,2),
  feedback_events jsonb DEFAULT '[]',
  quality_score integer,
  notes text
);

-- Voice profiles table
CREATE TABLE IF NOT EXISTS voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  analysis_data jsonb DEFAULT '{}',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Feedback events table
CREATE TABLE IF NOT EXISTS feedback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('authentic', 'mask', 'crazy', 'achievement')),
  message text NOT NULL,
  drift_level numeric(5,2),
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can read their matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Conversations policies
CREATE POLICY "Users can read conversations from their matches"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = conversations.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create conversations for their matches"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update conversations from their matches"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = conversations.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Voice profiles policies
CREATE POLICY "Users can read own voice profiles"
  ON voice_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own voice profiles"
  ON voice_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice profiles"
  ON voice_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Feedback events policies
CREATE POLICY "Users can read feedback from their conversations"
  ON feedback_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches m ON c.match_id = m.id
      WHERE c.id = feedback_events.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create feedback for their conversations"
  ON feedback_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches m ON c.match_id = m.id
      WHERE c.id = conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_personality_type ON profiles(personality_type);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_events_conversation_id ON feedback_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_events_timestamp ON feedback_events(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Matching algorithm function
CREATE OR REPLACE FUNCTION find_match(user_id uuid, personality text)
RETURNS TABLE(match_user_id uuid, match_score integer) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as match_user_id,
    CASE 
      WHEN p.personality_type = personality THEN 100
      WHEN (p.personality_type = 'real-me' AND personality IN ('my-mask', 'crazy-self')) THEN 75
      WHEN (p.personality_type IN ('my-mask', 'crazy-self') AND personality = 'real-me') THEN 75
      ELSE 50
    END as match_score
  FROM profiles p
  WHERE p.id != user_id
    AND p.id NOT IN (
      SELECT CASE 
        WHEN m.user1_id = user_id THEN m.user2_id
        ELSE m.user1_id
      END
      FROM matches m
      WHERE (m.user1_id = user_id OR m.user2_id = user_id)
        AND m.status IN ('pending', 'active')
    )
  ORDER BY match_score DESC, RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for voice profiles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-profiles', 'voice-profiles', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice profiles
CREATE POLICY "Users can upload their own voice profiles"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own voice profiles"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own voice profiles"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'voice-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice profiles"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'voice-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);