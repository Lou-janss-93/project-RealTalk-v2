'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Heart, 
  Plus,
  Filter,
  Sparkles,
  User,
  Star,
  Zap,
  Volume2,
  Send
} from 'lucide-react';
import { getCurrentUser, createPost, getPosts, toggleResonance, Post } from '@/lib/supabase';
import { Language, useTranslation, getStoredLanguage } from '@/lib/i18n';

type PersonaFilter = 'all' | 'roots' | 'mask' | 'spark';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [activeFilter, setActiveFilter] = useState<PersonaFilter>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);
  const [postContent, setPostContent] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<'roots' | 'mask' | 'spark'>('roots');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const router = useRouter();
  const t = useTranslation(language);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    loadUserAndPosts();
  }, []);

  const loadUserAndPosts = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      setUser(currentUser);
      await loadPosts();
    } catch (error) {
      console.error('Error loading user and posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const filter = activeFilter === 'all' ? undefined : activeFilter;
      const postsData = await getPosts(filter);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeFilter]);

  const getPersonaInfo = (persona: string) => {
    switch (persona) {
      case 'roots':
        return {
          title: t.personalities.roots,
          icon: User,
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800'
        };
      case 'mask':
        return {
          title: t.personalities.mask,
          icon: Star,
          color: 'from-purple-500 to-violet-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800'
        };
      case 'spark':
        return {
          title: t.personalities.spark,
          icon: Zap,
          color: 'from-orange-500 to-pink-600',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-800'
        };
      default:
        return {
          title: 'Unknown',
          icon: User,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800'
        };
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({
          blob: audioBlob,
          url: audioUrl,
          duration: 30 // Placeholder duration
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 60000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleCreatePost = async () => {
    if (!user || (!postContent.trim() && !recordedAudio)) return;

    try {
      const newPost = await createPost(
        user.id,
        postContent.trim(),
        recordedAudio?.blob,
        selectedPersona
      );

      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setPostContent('');
      setRecordedAudio(null);
      setShowCreatePost(false);
      
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleResonance = async (postId: string) => {
    if (!user) return;

    try {
      await toggleResonance(postId, user.id);
      await loadPosts(); // Reload to get updated counts
    } catch (error) {
      console.error('Error toggling resonance:', error);
    }
  };

  const playAudio = (audioUrl: string, postId: string) => {
    if (playingAudio === postId) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingAudio(postId);
    
    audio.onended = () => {
      setPlayingAudio(null);
    };
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

  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient-blue mb-4">
            {t.posts.feedTitle}
          </h1>
          <p className="text-xl text-gray-600">
            Authentic moments from the community
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-2 glass-card rounded-2xl p-2">
            {[
              { key: 'all', label: t.posts.allPersonas, icon: Sparkles },
              { key: 'roots', label: t.posts.rootsFeed, icon: User },
              { key: 'mask', label: t.posts.maskFeed, icon: Star },
              { key: 'spark', label: t.posts.sparkFeed, icon: Zap }
            ].map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as PersonaFilter)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeFilter === filter.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white glow-blue'
                      : 'text-gray-600 glass-button'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 floating-element glow-blue"
          >
            <Plus className="w-5 h-5" />
            <span>{t.posts.createPost}</span>
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full floating-element">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t.posts.shareThought}
              </h3>

              {/* Persona Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose your persona:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['roots', 'mask', 'spark'] as const).map((persona) => {
                    const info = getPersonaInfo(persona);
                    const IconComponent = info.icon;
                    return (
                      <button
                        key={persona}
                        onClick={() => setSelectedPersona(persona)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 floating-element ${
                          selectedPersona === persona
                            ? 'border-blue-500 glass-strong glow-blue'
                            : 'border-white/30 glass-button'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <p className="text-xs font-medium text-gray-700">
                          {info.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Content */}
              <div className="mb-6">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder={t.posts.recordingTip}
                  className="w-full p-4 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Voice Recording */}
              <div className="mb-6">
                <div className="text-center">
                  {!recordedAudio ? (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse glow-orange'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 glow-blue'
                      } text-white floating-element`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="glass-subtle rounded-xl p-4">
                        <audio controls src={recordedAudio.url} className="w-full" />
                      </div>
                      <button
                        onClick={() => setRecordedAudio(null)}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Record again
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {isRecording ? 'Recording...' : t.posts.maxDuration}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setPostContent('');
                    setRecordedAudio(null);
                  }}
                  className="flex-1 px-4 py-3 glass-button text-gray-700 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() && !recordedAudio}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-blue"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t.posts.noPostsYet}
              </h3>
              <p className="text-gray-600 mb-6">
                {t.posts.createFirstPost}
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 floating-element glow-blue"
              >
                {t.posts.createPost}
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const personaInfo = getPersonaInfo(post.persona_type);
              const PersonaIcon = personaInfo.icon;
              
              return (
                <div key={post.id} className="glass-card rounded-3xl p-6 floating-element">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* User Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center glow-purple">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {post.profiles?.full_name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${personaInfo.bgColor} ${personaInfo.textColor}`}>
                            <PersonaIcon className="w-3 h-3" />
                            <span>{personaInfo.title}</span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Authenticity Score */}
                    {post.authenticity_score && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAuthenticityColor(post.authenticity_score)}`}>
                        {Math.round(post.authenticity_score)}% authentic
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed">{post.content}</p>
                    </div>
                  )}

                  {/* Audio Content */}
                  {post.audio_url && (
                    <div className="mb-4 p-4 glass-subtle rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => playAudio(post.audio_url!, post.id)}
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 glow-blue floating-element"
                        >
                          {playingAudio === post.id ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Voice message</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/30">
                    <button
                      onClick={() => handleResonance(post.id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-button transition-all duration-300 group floating-element"
                    >
                      <Heart className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                      <span className="text-gray-600 group-hover:text-gray-900">
                        {post.resonance_count} {t.posts.resonance}
                      </span>
                    </button>

                    <button className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-button transition-all duration-300 group floating-element">
                      <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      <span className="text-gray-600 group-hover:text-gray-900">
                        {post.comment_count} {t.posts.comments}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}