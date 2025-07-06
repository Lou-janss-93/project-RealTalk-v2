'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  AlertCircle,
  Wifi,
  WifiOff,
  User,
  Star,
  Zap,
  Heart,
  Award,
  Sparkles
} from 'lucide-react';
import RealityDriftMeter from './RealityDriftMeter';

interface ConversationScreenProps {
  matchId?: string;
  partnerName?: string;
  partnerAvatar?: string;
  authFeedback?: {
    type: 'authentic' | 'mask' | 'crazy' | 'achievement';
    message: string;
    timestamp: number;
  } | null;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type AudioStatus = 'muted' | 'unmuted' | 'connecting';

interface FeedbackEvent {
  id: string;
  type: 'authentic' | 'mask' | 'crazy' | 'achievement';
  message: string;
  emoji: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<any>;
  timestamp: number;
}

export default function ConversationScreen({
  matchId = 'demo_match',
  partnerName = 'Alex',
  partnerAvatar,
  authFeedback
}: ConversationScreenProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('connecting');
  const [partnerAudioStatus, setPartnerAudioStatus] = useState<AudioStatus>('connecting');
  const [driftLevel, setDriftLevel] = useState(25);
  const [conversationTime, setConversationTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEvent[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackEvent | null>(null);
  
  const router = useRouter();
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Predefined feedback messages based on drift levels and behaviors
  const getFeedbackForDriftLevel = (level: number, previousLevel: number): FeedbackEvent | null => {
    const change = level - previousLevel;
    const id = `feedback_${Date.now()}_${Math.random()}`;
    const timestamp = Date.now();

    // Very authentic (0-20%)
    if (level <= 20 && previousLevel > 30) {
      return {
        id,
        type: 'authentic',
        message: '👍 Echt gebleven!',
        emoji: '👍',
        color: 'text-green-800',
        bgColor: 'from-green-400 to-emerald-500',
        icon: Heart,
        timestamp
      };
    }

    // Entering mask mode (40-60%)
    if (level >= 40 && level <= 60 && previousLevel < 40) {
      return {
        id,
        type: 'mask',
        message: '🎭 Je laat je Mask zien!',
        emoji: '🎭',
        color: 'text-purple-800',
        bgColor: 'from-purple-400 to-violet-500',
        icon: Star,
        timestamp
      };
    }

    // Going crazy (80%+)
    if (level >= 80 && previousLevel < 80) {
      return {
        id,
        type: 'crazy',
        message: '⚡ Je laat je Crazy Self zien!',
        emoji: '⚡',
        color: 'text-orange-800',
        bgColor: 'from-orange-400 to-red-500',
        icon: Zap,
        timestamp
      };
    }

    // Big authenticity drop
    if (change < -30) {
      return {
        id,
        type: 'authentic',
        message: '✨ Terug naar jezelf!',
        emoji: '✨',
        color: 'text-blue-800',
        bgColor: 'from-blue-400 to-cyan-500',
        icon: Sparkles,
        timestamp
      };
    }

    return null;
  };

  // Handle external feedback prop
  useEffect(() => {
    if (authFeedback) {
      const feedbackEvent: FeedbackEvent = {
        id: `external_${authFeedback.timestamp}`,
        type: authFeedback.type,
        message: authFeedback.message,
        emoji: authFeedback.type === 'authentic' ? '👍' : 
               authFeedback.type === 'mask' ? '🎭' : 
               authFeedback.type === 'crazy' ? '⚡' : '🏆',
        color: authFeedback.type === 'authentic' ? 'text-green-800' :
               authFeedback.type === 'mask' ? 'text-purple-800' :
               authFeedback.type === 'crazy' ? 'text-orange-800' : 'text-yellow-800',
        bgColor: authFeedback.type === 'authentic' ? 'from-green-400 to-emerald-500' :
                 authFeedback.type === 'mask' ? 'from-purple-400 to-violet-500' :
                 authFeedback.type === 'crazy' ? 'from-orange-400 to-red-500' : 'from-yellow-400 to-amber-500',
        icon: authFeedback.type === 'authentic' ? Heart :
              authFeedback.type === 'mask' ? Star :
              authFeedback.type === 'crazy' ? Zap : Award,
        timestamp: authFeedback.timestamp
      };
      
      showFeedback(feedbackEvent);
    }
  }, [authFeedback]);

  // Track drift level changes for automatic feedback
  const previousDriftRef = useRef(driftLevel);
  useEffect(() => {
    const feedback = getFeedbackForDriftLevel(driftLevel, previousDriftRef.current);
    if (feedback) {
      showFeedback(feedback);
    }
    previousDriftRef.current = driftLevel;
  }, [driftLevel]);

  // Show feedback popup
  const showFeedback = (feedback: FeedbackEvent) => {
    setFeedbackEvents(prev => [...prev, feedback]);
    setActiveFeedback(feedback);

    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Hide feedback after 3 seconds
    feedbackTimeoutRef.current = setTimeout(() => {
      setActiveFeedback(null);
    }, 3000);
  };

  // Simulate random feedback events for demo
  const triggerRandomFeedback = () => {
    const feedbackTypes = [
      {
        type: 'authentic' as const,
        messages: ['👍 Echt gebleven!', '💯 Zo authentiek!', '✨ Puur jezelf!'],
        bgColor: 'from-green-400 to-emerald-500',
        color: 'text-green-800',
        icon: Heart
      },
      {
        type: 'mask' as const,
        messages: ['🎭 Je laat je Mask zien!', '👑 Perfecte presentatie!', '✨ Stijlvol gemaskeerd!'],
        bgColor: 'from-purple-400 to-violet-500',
        color: 'text-purple-800',
        icon: Star
      },
      {
        type: 'crazy' as const,
        messages: ['⚡ Je laat je Crazy Self zien!', '🔥 Volledig losgelaten!', '🎉 Wild en vrij!'],
        bgColor: 'from-orange-400 to-red-500',
        color: 'text-orange-800',
        icon: Zap
      },
      {
        type: 'achievement' as const,
        messages: ['🏆 Geweldige connectie!', '⭐ Gesprek meester!', '🎯 Perfect gebalanceerd!'],
        bgColor: 'from-yellow-400 to-amber-500',
        color: 'text-yellow-800',
        icon: Award
      }
    ];

    const randomType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];
    
    const feedback: FeedbackEvent = {
      id: `random_${Date.now()}_${Math.random()}`,
      type: randomType.type,
      message: randomMessage,
      emoji: randomMessage.charAt(0),
      color: randomType.color,
      bgColor: randomType.bgColor,
      icon: randomType.icon,
      timestamp: Date.now()
    };

    showFeedback(feedback);
  };

  // Simulate connection process
  useEffect(() => {
    const connectSequence = async () => {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      
      // Simulate audio connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAudioStatus('unmuted');
      setPartnerAudioStatus('unmuted');
      
      // Start conversation timer
      startConversationTimer();

      // Show welcome feedback
      setTimeout(() => {
        const welcomeFeedback: FeedbackEvent = {
          id: 'welcome',
          type: 'achievement',
          message: '🎉 Gesprek gestart!',
          emoji: '🎉',
          color: 'text-blue-800',
          bgColor: 'from-blue-400 to-cyan-500',
          icon: Sparkles,
          timestamp: Date.now()
        };
        showFeedback(welcomeFeedback);
      }, 3000);
    };

    connectSequence();

    // Simulate occasional drift level changes
    const driftInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 5 seconds
        const change = (Math.random() - 0.5) * 20; // ±10 change
        setDriftLevel(prev => Math.max(0, Math.min(100, prev + change)));
      }
    }, 5000);

    // Simulate random feedback events every 15-30 seconds
    const feedbackInterval = setInterval(() => {
      if (Math.random() > 0.6 && connectionStatus === 'connected') { // 40% chance
        triggerRandomFeedback();
      }
    }, Math.random() * 15000 + 15000); // 15-30 seconds

    return () => {
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      if (conversationTimerRef.current) clearInterval(conversationTimerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      clearInterval(driftInterval);
      clearInterval(feedbackInterval);
    };
  }, [connectionStatus]);

  const startConversationTimer = () => {
    conversationTimerRef.current = setInterval(() => {
      setConversationTime(prev => prev + 1);
    }, 1000);
  };

  const toggleMicrophone = () => {
    setAudioStatus(prev => prev === 'muted' ? 'unmuted' : 'muted');
  };

  const endConversation = () => {
    setIsCallActive(false);
    setConnectionStatus('disconnected');
    
    // Show end screen briefly then navigate
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          text: 'Verbinden...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: AlertCircle
        };
      case 'connected':
        return {
          text: 'Verbonden',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: Wifi
        };
      case 'disconnected':
        return {
          text: 'Verbinding verbroken',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: WifiOff
        };
      case 'error':
        return {
          text: 'Verbindingsfout',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: WifiOff
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (!isCallActive && connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhoneOff className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gesprek Beëindigd
          </h2>
          <p className="text-gray-600 mb-4">
            Gespreksduur: {formatTime(conversationTime)}
          </p>
          <p className="text-sm text-gray-500">
            Je wordt doorgestuurd naar het dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col relative">
      {/* Feedback Popup Overlay */}
      {activeFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="relative z-10 pointer-events-auto">
            <div className={`
              bg-gradient-to-r ${activeFeedback.bgColor} 
              text-white px-8 py-6 rounded-3xl shadow-2xl 
              transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-500
              border border-white/20 backdrop-blur-sm
              max-w-sm mx-4 text-center
            `}>
              <div className="flex items-center justify-center space-x-3 mb-2">
                <activeFeedback.icon className="w-8 h-8 text-white" />
                <span className="text-3xl">{activeFeedback.emoji}</span>
              </div>
              <p className="text-xl font-bold text-white mb-1">
                {activeFeedback.message}
              </p>
              <div className="w-full bg-white/20 rounded-full h-1 mt-4">
                <div className="bg-white h-1 rounded-full animate-pulse" style={{
                  animation: 'shrink 3s linear forwards'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Section - Audio/Video Area */}
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {partnerAvatar ? (
                  <img 
                    src={partnerAvatar} 
                    alt={partnerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                {/* Online indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{partnerName}</h1>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-mono text-gray-900">
                {formatTime(conversationTime)}
              </div>
              <div className="text-sm text-gray-500">
                Gesprekstijd
              </div>
            </div>
          </div>

          {/* Main Audio Area */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 min-h-96 flex items-center justify-center">
            {connectionStatus === 'connecting' ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verbinden met {partnerName}...
                </h3>
                <p className="text-gray-600">
                  Audio wordt geïnitialiseerd
                </p>
              </div>
            ) : connectionStatus === 'connected' ? (
              <div className="text-center w-full">
                {/* TODO: Integrate actual audio stream here */}
                {/* This would be where WebRTC or similar audio streaming would be implemented */}
                
                {/* Audio Visualization Placeholder */}
                <div className="flex items-center justify-center space-x-8 mb-8">
                  {/* Your audio indicator */}
                  <div className="text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${
                      audioStatus === 'muted' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {audioStatus === 'muted' ? (
                        <MicOff className="w-8 h-8 text-red-500" />
                      ) : (
                        <Mic className="w-8 h-8 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Jij</p>
                  </div>

                  {/* Connection indicator */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse animation-delay-200" />
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse animation-delay-400" />
                  </div>

                  {/* Partner audio indicator */}
                  <div className="text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${
                      partnerAudioStatus === 'muted' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {partnerAudioStatus === 'muted' ? (
                        <VolumeX className="w-8 h-8 text-red-500" />
                      ) : (
                        <Volume2 className="w-8 h-8 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{partnerName}</p>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button
                    onClick={toggleMicrophone}
                    className={`p-4 rounded-full transition-all duration-300 ${
                      audioStatus === 'muted' 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {audioStatus === 'muted' ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>

                  <button className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                    <Settings className="w-6 h-6" />
                  </button>

                  <button
                    onClick={endConversation}
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>

                {/* Demo Feedback Button */}
                <button
                  onClick={triggerRandomFeedback}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Simuleer Feedback
                </button>

                <p className="text-sm text-gray-500 mt-4">
                  {audioStatus === 'muted' ? 'Microfoon uitgeschakeld' : 'Audio actief'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verbindingsprobleem
                </h3>
                <p className="text-gray-600">
                  Kan geen verbinding maken met {partnerName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Reality Drift Meter */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <RealityDriftMeter 
            driftLevel={driftLevel}
            onLevelChange={setDriftLevel}
          />
        </div>
      </div>

      {/* Custom animations and styles */}
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}