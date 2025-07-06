'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Clock, Users, TrendingUp, Calendar, Play } from 'lucide-react';
import { supabase, getCurrentUser, isDemoMode } from '@/lib/supabase';

interface ConversationRecord {
  id: string;
  match_id: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  avg_drift_level?: number;
  quality_score?: number;
  partner_name?: string;
  partner_avatar?: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalDuration: 0,
    avgDriftLevel: 0,
    avgQualityScore: 0
  });
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      if (isDemoMode) {
        // Provide mock conversation data for demo mode
        const mockConversations: ConversationRecord[] = [
          {
            id: 'demo-1',
            match_id: 'match-demo-1',
            started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            ended_at: new Date(Date.now() - 86400000 + 1800000).toISOString(), // 30 min duration
            duration: 1800,
            avg_drift_level: 25,
            quality_score: 85,
            partner_name: 'Demo Partner',
            partner_avatar: undefined
          },
          {
            id: 'demo-2',
            match_id: 'match-demo-2',
            started_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            ended_at: new Date(Date.now() - 172800000 + 2400000).toISOString(), // 40 min duration
            duration: 2400,
            avg_drift_level: 45,
            quality_score: 72,
            partner_name: 'Another Demo User',
            partner_avatar: undefined
          }
        ];

        setConversations(mockConversations);

        // Calculate demo stats
        const totalConversations = mockConversations.length;
        const totalDuration = mockConversations.reduce((sum, conv) => sum + (conv.duration || 0), 0);
        const avgDriftLevel = mockConversations.reduce((sum, conv) => sum + (conv.avg_drift_level || 0), 0) / totalConversations || 0;
        const avgQualityScore = mockConversations.reduce((sum, conv) => sum + (conv.quality_score || 0), 0) / totalConversations || 0;

        setStats({
          totalConversations,
          totalDuration,
          avgDriftLevel,
          avgQualityScore
        });

        setLoading(false);
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get conversations from matches where user participated
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          matches!inner(
            user1_id,
            user2_id,
            profiles!matches_user1_id_fkey(full_name, avatar_url),
            profiles!matches_user2_id_fkey(full_name, avatar_url)
          )
        `)
        .or(`matches.user1_id.eq.${user.id},matches.user2_id.eq.${user.id}`)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Process conversations to add partner info
      const processedConversations = conversationsData?.map(conv => {
        const match = conv.matches;
        const isUser1 = match.user1_id === user.id;
        const partnerProfile = isUser1 ? match.profiles : match.profiles;
        
        return {
          ...conv,
          partner_name: partnerProfile?.full_name || 'Onbekend',
          partner_avatar: partnerProfile?.avatar_url
        };
      }) || [];

      setConversations(processedConversations);

      // Calculate stats
      const totalConversations = processedConversations.length;
      const totalDuration = processedConversations.reduce((sum, conv) => sum + (conv.duration || 0), 0);
      const avgDriftLevel = processedConversations.reduce((sum, conv) => sum + (conv.avg_drift_level || 0), 0) / totalConversations || 0;
      const avgQualityScore = processedConversations.reduce((sum, conv) => sum + (conv.quality_score || 0), 0) / totalConversations || 0;

      setStats({
        totalConversations,
        totalDuration,
        avgDriftLevel,
        avgQualityScore
      });

    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDriftLevelColor = (level: number) => {
    if (level <= 20) return 'text-green-600 bg-green-100';
    if (level <= 40) return 'text-blue-600 bg-blue-100';
    if (level <= 60) return 'text-yellow-600 bg-yellow-100';
    if (level <= 80) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityStars = (score: number) => {
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Gesprekken laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Jouw Gesprekken
          </h1>
          <p className="text-xl text-gray-600">
            Bekijk je gesprekgeschiedenis en statistieken
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
                <p className="text-sm text-gray-600">Totaal Gesprekken</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                <p className="text-sm text-gray-600">Totale Tijd</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgDriftLevel)}%</p>
                <p className="text-sm text-gray-600">Gem. Drift Level</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getQualityStars(stats.avgQualityScore)}</p>
                <p className="text-sm text-gray-600">Gem. Kwaliteit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recente Gesprekken</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nog geen gesprekken
              </h3>
              <p className="text-gray-600 mb-6">
                Start je eerste gesprek door een match te zoeken!
              </p>
              <button
                onClick={() => router.push('/matching')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Vind een Match
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Partner Avatar */}
                      <div className="relative">
                        {conversation.partner_avatar ? (
                          <img 
                            src={conversation.partner_avatar} 
                            alt={conversation.partner_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conversation.partner_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(conversation.started_at)}</span>
                          </div>
                          {conversation.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(conversation.duration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex items-center space-x-4">
                      {/* Drift Level */}
                      {typeof conversation.avg_drift_level === 'number' && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDriftLevelColor(conversation.avg_drift_level)}`}>
                          {Math.round(conversation.avg_drift_level)}% drift
                        </div>
                      )}

                      {/* Quality Score */}
                      {conversation.quality_score && (
                        <div className="text-yellow-500 text-lg">
                          {getQualityStars(conversation.quality_score)}
                        </div>
                      )}

                      {/* Replay Button */}
                      <button
                        onClick={() => router.push(`/conversation?matchId=${conversation.match_id}&replay=true`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bekijk details"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {conversations.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/matching')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Nieuw Gesprek
            </button>
          </div>
        )}
      </div>
    </div>
  );
}