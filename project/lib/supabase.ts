import { createClient } from '@supabase/supabase-js';

// For demo mode, we'll use mock data when Supabase isn't available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        // Disable realtime in WebContainer to avoid WebSocket issues
        params: {
          eventsPerSecond: 2,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Database types
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  personality_type: 'roots' | 'mask' | 'spark';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  ended_at?: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  avg_drift_level?: number;
  feedback_events: any[];
}

export interface VoiceProfile {
  id: string;
  user_id: string;
  audio_url: string;
  analysis_data?: any;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  audio_url?: string;
  persona_type: 'roots' | 'mask' | 'spark';
  authenticity_score?: number;
  resonance_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content?: string;
  audio_url?: string;
  created_at: string;
  profiles?: Profile;
}

export interface PostResonance {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Demo mode helpers - use localStorage when Supabase isn't available
const DEMO_MODE = !supabase;

// Mock user for demo
const createMockUser = (email: string, personality: string) => ({
  id: `demo_${Date.now()}`,
  email,
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { personality_type: personality }
});

// Auth helpers
export const getCurrentUser = async () => {
  if (DEMO_MODE) {
    // Return mock user from localStorage
    const demoUser = localStorage.getItem('demoUser');
    return demoUser ? JSON.parse(demoUser) : null;
  }

  if (!supabase) return null;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.warn('Auth check failed:', error);
    return null;
  }
};

export const getProfile = async (userId: string) => {
  if (DEMO_MODE) {
    // Return mock profile from localStorage
    const demoProfile = localStorage.getItem('demoProfile');
    if (demoProfile) {
      return JSON.parse(demoProfile);
    }
    
    // Create default demo profile
    const personality = localStorage.getItem('userPersonality') || 'roots';
    const mockProfile = {
      id: userId,
      email: 'demo@realtalk.com',
      full_name: 'Demo User',
      personality_type: personality,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('demoProfile', JSON.stringify(mockProfile));
    return mockProfile;
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  if (DEMO_MODE) {
    // Update mock profile in localStorage
    const currentProfile = await getProfile(userId);
    const updatedProfile = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('demoProfile', JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
};

// Demo authentication functions
export const demoSignUp = async (email: string, password: string, fullName: string) => {
  if (!DEMO_MODE) throw new Error('Demo mode not active');
  
  const personality = localStorage.getItem('userPersonality') || 'roots';
  const mockUser = createMockUser(email, personality);
  const mockProfile = {
    id: mockUser.id,
    email,
    full_name: fullName,
    personality_type: personality,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem('demoUser', JSON.stringify(mockUser));
  localStorage.setItem('demoProfile', JSON.stringify(mockProfile));
  
  return { user: mockUser, profile: mockProfile };
};

export const demoSignIn = async (email: string, password: string) => {
  if (!DEMO_MODE) throw new Error('Demo mode not active');
  
  // For demo, accept any email/password
  const personality = localStorage.getItem('userPersonality') || 'roots';
  const mockUser = createMockUser(email, personality);
  const mockProfile = {
    id: mockUser.id,
    email,
    full_name: 'Demo User',
    personality_type: personality,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem('demoUser', JSON.stringify(mockUser));
  localStorage.setItem('demoProfile', JSON.stringify(mockProfile));
  
  return { user: mockUser, profile: mockProfile };
};

export const demoSignOut = async () => {
  localStorage.removeItem('demoUser');
  localStorage.removeItem('demoProfile');
  localStorage.removeItem('userPersonality');
};

// Posts helpers
export const createPost = async (userId: string, content: string, audioBlob?: Blob, personaType: 'roots' | 'mask' | 'spark' = 'roots') => {
  if (DEMO_MODE) {
    // Mock post creation for demo
    const mockPost: Post = {
      id: 'demo_post_' + Date.now(),
      user_id: userId,
      content,
      audio_url: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      persona_type: personaType,
      authenticity_score: Math.floor(Math.random() * 40) + 60, // 60-100 for demo
      resonance_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage for demo
    const existingPosts = JSON.parse(localStorage.getItem('demoPosts') || '[]');
    existingPosts.unshift(mockPost);
    localStorage.setItem('demoPosts', JSON.stringify(existingPosts));
    
    return mockPost;
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  
  let audioUrl = null;
  if (audioBlob) {
    const fileName = `posts/${userId}/${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-audio')
      .upload(fileName, audioBlob);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-audio')
      .getPublicUrl(fileName);
    
    audioUrl = publicUrl;
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      audio_url: audioUrl,
      persona_type: personaType,
      authenticity_score: Math.floor(Math.random() * 40) + 60 // Placeholder scoring
    })
    .select(`
      *,
      profiles(id, full_name, username, avatar_url, personality_type)
    `)
    .single();
  
  if (error) throw error;
  return data as Post;
};

export const getPosts = async (personaFilter?: 'roots' | 'mask' | 'spark') => {
  if (DEMO_MODE) {
    // Return mock posts from localStorage
    const posts = JSON.parse(localStorage.getItem('demoPosts') || '[]');
    const profile = JSON.parse(localStorage.getItem('demoProfile') || '{}');
    
    // Add profile data to posts
    const postsWithProfile = posts.map((post: Post) => ({
      ...post,
      profiles: profile
    }));
    
    if (personaFilter) {
      return postsWithProfile.filter((post: Post) => post.persona_type === personaFilter);
    }
    
    return postsWithProfile;
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles(id, full_name, username, avatar_url, personality_type)
    `)
    .order('created_at', { ascending: false });
  
  if (personaFilter) {
    query = query.eq('persona_type', personaFilter);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Post[];
};

export const toggleResonance = async (postId: string, userId: string) => {
  if (DEMO_MODE) {
    // Mock resonance toggle for demo
    const posts = JSON.parse(localStorage.getItem('demoPosts') || '[]');
    const postIndex = posts.findIndex((p: Post) => p.id === postId);
    
    if (postIndex !== -1) {
      const resonances = JSON.parse(localStorage.getItem('demoResonances') || '[]');
      const existingResonance = resonances.find((r: any) => r.post_id === postId && r.user_id === userId);
      
      if (existingResonance) {
        // Remove resonance
        const newResonances = resonances.filter((r: any) => !(r.post_id === postId && r.user_id === userId));
        localStorage.setItem('demoResonances', JSON.stringify(newResonances));
        posts[postIndex].resonance_count = Math.max(0, posts[postIndex].resonance_count - 1);
      } else {
        // Add resonance
        resonances.push({
          id: 'demo_resonance_' + Date.now(),
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('demoResonances', JSON.stringify(resonances));
        posts[postIndex].resonance_count += 1;
      }
      
      localStorage.setItem('demoPosts', JSON.stringify(posts));
      return posts[postIndex];
    }
    return null;
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  
  // Check if resonance already exists
  const { data: existingResonance } = await supabase
    .from('post_resonances')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  if (existingResonance) {
    // Remove resonance
    await supabase
      .from('post_resonances')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
  } else {
    // Add resonance
    await supabase
      .from('post_resonances')
      .insert({ post_id: postId, user_id: userId });
  }
  
  // Return updated post
  const { data: updatedPost } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(id, full_name, username, avatar_url, personality_type)
    `)
    .eq('id', postId)
    .single();
  
  return updatedPost;
};

// Matching helpers
export const findMatch = async (userId: string, personalityType: string) => {
  if (DEMO_MODE) {
    // Return mock match for demo
    return {
      id: 'demo_match_' + Date.now(),
      user_id: 'demo_partner_' + Date.now(),
      username: 'Alex',
      personality: personalityType,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  try {
    const { data, error } = await supabase.rpc('find_match', {
      user_id: userId,
      personality: personalityType
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Matching failed:', error);
    return null;
  }
};

export const createMatch = async (user1Id: string, user2Id: string) => {
  if (DEMO_MODE) {
    // Return mock match
    return {
      id: 'demo_match_' + Date.now(),
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Match;
};

// Conversation helpers
export const createConversation = async (matchId: string) => {
  if (DEMO_MODE) {
    // Return mock conversation
    return {
      id: 'demo_conversation_' + Date.now(),
      match_id: matchId,
      started_at: new Date().toISOString(),
      feedback_events: []
    };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      match_id: matchId,
      started_at: new Date().toISOString(),
      feedback_events: []
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Conversation;
};

export const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
  if (DEMO_MODE) {
    // Mock update for demo
    return { id: conversationId, ...updates };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Conversation;
};

// Voice profile helpers
export const uploadVoiceProfile = async (userId: string, audioBlob: Blob) => {
  if (DEMO_MODE) {
    // Mock voice profile for demo
    const audioUrl = URL.createObjectURL(audioBlob);
    return {
      id: 'demo_voice_' + Date.now(),
      user_id: userId,
      audio_url: audioUrl,
      created_at: new Date().toISOString()
    };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  const fileName = `voice-profiles/${userId}/${Date.now()}.webm`;
  
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-profiles')
      .upload(fileName, audioBlob);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('voice-profiles')
      .getPublicUrl(fileName);
    
    const { data, error } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: userId,
        audio_url: publicUrl
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as VoiceProfile;
  } catch (error) {
    console.warn('Voice upload failed:', error);
    throw error;
  }
};

// Real-time subscriptions (with fallback for WebContainer)
export const subscribeToMatches = (userId: string, callback: (match: Match) => void) => {
  if (DEMO_MODE) {
    // Mock subscription for demo
    return { unsubscribe: () => {} };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    return supabase
      .channel('matches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Match);
      })
      .subscribe();
  } catch (error) {
    console.warn('Real-time subscription failed:', error);
    return { unsubscribe: () => {} };
  }
};

export const subscribeToConversations = (matchId: string, callback: (conversation: Conversation) => void) => {
  if (DEMO_MODE) {
    // Mock subscription for demo
    return { unsubscribe: () => {} };
  }

  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        callback(payload.new as Conversation);
      })
      .subscribe();
  } catch (error) {
    console.warn('Real-time subscription failed:', error);
    return { unsubscribe: () => {} };
  }
};

// Export demo mode flag for components to use
export const isDemoMode = DEMO_MODE;