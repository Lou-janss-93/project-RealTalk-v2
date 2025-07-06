'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Shield, 
  Mic, 
  Play, 
  Pause,
  Heart,
  Star,
  Zap,
  TrendingUp,
  MessageCircle,
  Users,
  Award,
  Volume2
} from 'lucide-react';
import { supabase, getCurrentUser, getProfile, updateProfile, getPosts, Post } from '@/lib/supabase';
import { Language, useTranslation, getStoredLanguage } from '@/lib/i18n';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  personality_type: 'roots' | 'mask' | 'spark';
  bio?: string;
  voice_bio_url?: string;
  created_at: string;
}

interface PersonaStats {
  roots: number;
  mask: number;
  spark: number;
  totalPosts: number;
  avgAuthenticityScore: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [personaStats, setPersonaStats] = useState<PersonaStats>({
    roots: 0,
    mask: 0,
    spark: 0,
    totalPosts: 0,
    avgAuthenticityScore: 0
  });
  const [recentPosts, setRecentPosts] = useState<{
    roots: Post[];
    mask: Post[];
    spark: Post[];
  }>({
    roots: [],
    mask: [],
    spark: []
  });
  const [isRecordingBio, setIsRecordingBio] = useState(false);
  const [playingBio, setPlayingBio] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    personality_type: 'roots' as 'roots' | 'mask' | 'spark'
  });

  const router = useRouter();
  const t = useTranslation(language);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const profileData = await getProfile(user.id);
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        personality_type: profileData.personality_type || 'roots'
      });

      // Load user's posts and calculate stats
      await loadUserStats(user.id);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Get all user posts
      const allPosts = await getPosts();
      const userPosts = allPosts.filter((post: Post) => post.user_id === userId);

      // Calculate persona distribution
      const rootsPosts = userPosts.filter((p: Post) => p.persona_type === 'roots');
      const maskPosts = userPosts.filter((p: Post) => p.persona_type === 'mask');
      const sparkPosts = userPosts.filter((p: Post) => p.persona_type === 'spark');

      // Calculate average authenticity score
      const postsWithScores = userPosts.filter((p: Post) => p.authenticity_score);
      const avgScore = postsWithScores.length > 0 
        ? postsWithScores.reduce((sum: number, p: Post) => sum + (p.authenticity_score || 0), 0) / postsWithScores.length
        : 0;

      setPersonaStats({
        roots: rootsPosts.length,
        mask: maskPosts.length,
        spark: sparkPosts.length,
        totalPosts: userPosts.length,
        avgAuthenticityScore: avgScore
      });

      // Set recent posts (max 2 per persona)
      setRecentPosts({
        roots: rootsPosts.slice(0, 2),
        mask: maskPosts.slice(0, 2),
        spark: sparkPosts.slice(0, 2)
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError('');

    try {
      const updatedProfile = await updateProfile(profile.id, {
        full_name: editForm.full_name,
        username: editForm.username,
        bio: editForm.bio,
        personality_type: editForm.personality_type
      });

      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        personality_type: profile.personality_type || 'roots'
      });
    }
    setIsEditing(false);
    setError('');
  };

  const getPersonaInfo = (persona: string) => {
    switch (persona) {
      case 'roots':
        return {
          title: t.personalities.roots,
          description: t.personalities.rootsDescription,
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: Heart
        };
      case 'mask':
        return {
          title: t.personalities.mask,
          description: t.personalities.maskDescription,
          color: 'from-purple-500 to-violet-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          icon: Star
        };
      case 'spark':
        return {
          title: t.personalities.spark,
          description: t.personalities.sparkDescription,
          color: 'from-orange-500 to-pink-600',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-800',
          icon: Zap
        };
      default:
        return {
          title: 'Unknown',
          description: 'Unknown personality type',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          icon: User
        };
    }
  };

  const getPersonaPercentage = (count: number) => {
    if (personaStats.totalPosts === 0) return 0;
    return Math.round((count / personaStats.totalPosts) * 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const playVoiceBio = () => {
    if (!profile?.voice_bio_url) return;
    
    const audio = new Audio(profile.voice_bio_url);
    setPlayingBio(true);
    audio.play();
    
    audio.onended = () => {
      setPlayingBio(false);
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const personalityInfo = getPersonaInfo(profile.personality_type);
  const PersonalityIcon = personalityInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-xl text-gray-600">Manage your authentic presence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Cover Section */}
              <div className={`h-32 bg-gradient-to-r ${personalityInfo.color} relative`}>
                <div className="absolute top-4 right-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-2 bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-8">
                {/* Avatar and Basic Info */}
                <div className="flex items-start space-x-6 mb-8">
                  <div className="relative">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className={`w-24 h-24 bg-gradient-to-r ${personalityInfo.color} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Choose a username"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {profile.full_name || 'No name set'}
                        </h2>
                        <p className="text-lg text-gray-600 mb-2">
                          @{profile.username || 'no-username'}
                        </p>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Voice Bio Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Volume2 className="w-5 h-5" />
                    <span>Voice Bio</span>
                  </h3>
                  
                  {profile.voice_bio_url ? (
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={playVoiceBio}
                          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                        >
                          {playingBio ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Voice introduction</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsRecordingBio(true)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Re-record
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                      <Mic className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">
                        Record a voice introduction to let others hear your authentic self
                      </p>
                      <button
                        onClick={() => setIsRecordingBio(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Record Voice Bio
                      </button>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700">
                        {profile.bio || 'No bio added yet. Click edit to add one!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Personality Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Primary Persona</h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(['roots', 'mask', 'spark'] as const).map((type) => {
                        const info = getPersonaInfo(type);
                        const InfoIcon = info.icon;
                        return (
                          <label key={type} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name="personality_type"
                              value={type}
                              checked={editForm.personality_type === type}
                              onChange={(e) => setEditForm(prev => ({ ...prev, personality_type: e.target.value as 'roots' | 'mask' | 'spark' }))}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center`}>
                              <InfoIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{info.title}</p>
                              <p className="text-sm text-gray-600">{info.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`p-6 ${personalityInfo.bgColor} rounded-2xl`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${personalityInfo.color} rounded-2xl flex items-center justify-center`}>
                          <PersonalityIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className={`text-xl font-bold ${personalityInfo.textColor}`}>
                            {personalityInfo.title}
                          </h4>
                          <p className={`${personalityInfo.textColor} opacity-80`}>
                            {personalityInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Posts by Persona */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts by Persona</h3>
              
              <div className="space-y-6">
                {(['roots', 'mask', 'spark'] as const).map((persona) => {
                  const info = getPersonaInfo(persona);
                  const InfoIcon = info.icon;
                  const posts = recentPosts[persona];
                  
                  return (
                    <div key={persona} className="border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center`}>
                          <InfoIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{info.title}</h4>
                          <p className="text-sm text-gray-600">{posts.length} recent posts</p>
                        </div>
                      </div>
                      
                      {posts.length > 0 ? (
                        <div className="space-y-3">
                          {posts.map((post) => (
                            <div key={post.id} className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-800 text-sm line-clamp-2">{post.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</span>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Heart className="w-3 h-3" />
                                  <span>{post.resonance_count}</span>
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{post.comment_count}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No posts yet in this persona</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Analytics */}
          <div className="space-y-6">
            {/* Persona Distribution */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Persona Distribution</span>
              </h3>
              
              <div className="space-y-4">
                {(['roots', 'mask', 'spark'] as const).map((persona) => {
                  const info = getPersonaInfo(persona);
                  const InfoIcon = info.icon;
                  const count = personaStats[persona];
                  const percentage = getPersonaPercentage(count);
                  
                  return (
                    <div key={persona} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <InfoIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{info.title}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${info.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{count} posts</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Authenticity Score */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Authenticity Score</span>
              </h3>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${personaStats.avgAuthenticityScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                      {Math.round(personaStats.avgAuthenticityScore)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Average authenticity across all posts</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Total Posts</span>
                  </div>
                  <span className="font-semibold text-gray-900">{personaStats.totalPosts}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Account Status</span>
                  </div>
                  <span className="font-semibold text-green-600">Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/feed')}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">View Feed</span>
                </button>
                
                <button
                  onClick={() => router.push('/voice-capture')}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Mic className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">Voice Setup</span>
                </button>
                
                <button
                  onClick={() => router.push('/conversations')}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-900">Conversations</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}