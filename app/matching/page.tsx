'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Heart, MessageCircle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

type MatchingState = 'searching' | 'found' | 'failed' | 'connecting';

interface MatchData {
  userId: string;
  username: string;
  personality: string;
  avatar?: string;
}

export default function MatchingPage() {
  const [matchingState, setMatchingState] = useState<MatchingState>('searching');
  const [searchTime, setSearchTime] = useState(0);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [animationPhase, setAnimationPhase] = useState(0);
  
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxSearchTime = 30; // 30 seconds timeout

  // Initialize Socket.io connection
  useEffect(() => {
    // In production, replace with your actual Socket.io server URL
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';
    
    try {
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Connected to matching server');
        setConnectionStatus('connected');
        startMatching();
      });

      socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        setConnectionStatus('error');
        // Simulate matching for demo purposes when socket fails
        simulateMatching();
      });

      socket.on('matchFound', (data: MatchData) => {
        console.log('Match found:', data);
        handleMatchFound(data);
      });

      socket.on('matchTimeout', () => {
        console.log('Match timeout');
        handleMatchTimeout();
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from matching server');
        setConnectionStatus('connecting');
      });

    } catch (error) {
      console.log('Socket initialization error:', error);
      setConnectionStatus('error');
      // Fallback to simulation
      simulateMatching();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Animation phase cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Search timer
  useEffect(() => {
    if (matchingState === 'searching') {
      const timer = setInterval(() => {
        setSearchTime(prev => {
          if (prev >= maxSearchTime) {
            handleMatchTimeout();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [matchingState]);

  const startMatching = () => {
    const userPersonality = localStorage.getItem('userPersonality') || 'real-me';
    
    if (socketRef.current && connectionStatus === 'connected') {
      socketRef.current.emit('findMatch', {
        personality: userPersonality,
        preferences: {
          // Add any matching preferences here
        }
      });
    }
  };

  const simulateMatching = () => {
    // Simulate finding a match after 3-8 seconds for demo
    const delay = Math.random() * 5000 + 3000;
    
    searchTimerRef.current = setTimeout(() => {
      const shouldFindMatch = Math.random() > 0.3; // 70% chance of finding match
      
      if (shouldFindMatch) {
        const mockMatch: MatchData = {
          userId: 'user_' + Math.random().toString(36).substr(2, 9),
          username: 'Alex',
          personality: 'real-me',
          avatar: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`
        };
        handleMatchFound(mockMatch);
      } else {
        handleMatchTimeout();
      }
    }, delay);
  };

  const handleMatchFound = (data: MatchData) => {
    setMatchData(data);
    setMatchingState('found');
    
    // Transition to conversation after showing match
    setTimeout(() => {
      setMatchingState('connecting');
      setTimeout(() => {
        router.push(`/conversation?matchId=${data.userId}`);
      }, 2000);
    }, 3000);
  };

  const handleMatchTimeout = () => {
    setMatchingState('failed');
  };

  const retryMatching = () => {
    setMatchingState('searching');
    setSearchTime(0);
    setMatchData(null);
    
    if (socketRef.current && connectionStatus === 'connected') {
      startMatching();
    } else {
      simulateMatching();
    }
  };

  const getSearchingText = () => {
    const texts = [
      'Zoeken naar iemand om mee te praten',
      'Verbinden met gelijkgestemde zielen',
      'Vinden van je perfecte gesprekspartner',
      'Matchen op basis van je persoonlijkheid'
    ];
    return texts[animationPhase];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Searching State */}
        {matchingState === 'searching' && (
          <div className="text-center">
            {/* Animated Matching Visual */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Outer pulse rings */}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-purple-200 animate-ping animation-delay-200" />
                <div className="absolute inset-4 rounded-full border-4 border-pink-200 animate-ping animation-delay-400" />
                
                {/* Center icon */}
                <div className="absolute inset-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white animate-pulse" />
                </div>
                
                {/* Floating hearts */}
                <div className="absolute -top-2 -right-2 animate-bounce animation-delay-100">
                  <Heart className="w-6 h-6 text-pink-400 fill-current" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-bounce animation-delay-300">
                  <MessageCircle className="w-6 h-6 text-indigo-400 fill-current" />
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {getSearchingText()}
                <span className="inline-flex ml-1">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse animation-delay-200">.</span>
                  <span className="animate-pulse animation-delay-400">.</span>
                </span>
              </h1>
              <p className="text-gray-600">
                We zoeken naar de perfecte match voor jou
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Zoektijd</span>
                <span>{formatTime(searchTime)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(searchTime / maxSearchTime) * 100}%` }}
                />
              </div>
            </div>

            {/* Connection Status */}
            <div className="text-xs text-gray-400">
              Status: {connectionStatus === 'connected' ? 'Verbonden' : 
                      connectionStatus === 'connecting' ? 'Verbinden...' : 'Demo modus'}
            </div>
          </div>
        )}

        {/* Match Found State */}
        {matchingState === 'found' && matchData && (
          <div className="text-center">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Success rings */}
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-green-200 animate-pulse animation-delay-200" />
                
                {/* Match avatar or icon */}
                <div className="absolute inset-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                  {matchData.avatar ? (
                    <img 
                      src={matchData.avatar} 
                      alt={matchData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  )}
                </div>
                
                {/* Sparkles */}
                <div className="absolute -top-1 -right-1 animate-bounce">
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <div className="absolute -bottom-1 -left-1 animate-bounce animation-delay-300">
                  <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Match gevonden! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Je gaat praten met <strong>{matchData.username}</strong>
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Perfecte match
              </div>
            </div>

            {/* Transition message */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-gray-600">
                Je wordt doorverbonden naar het gesprek...
              </p>
              <div className="mt-4 w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}

        {/* Connection State */}
        {matchingState === 'connecting' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verbinden...
            </h1>
            <p className="text-gray-600">
              Je gesprek wordt voorbereid
            </p>
          </div>
        )}

        {/* No Match Found State */}
        {matchingState === 'failed' && (
          <div className="text-center">
            {/* Sad animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white opacity-50" />
                </div>
              </div>
            </div>

            {/* No match message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nog geen match gevonden
              </h1>
              <p className="text-gray-600 mb-4">
                Probeer het opnieuw, er zijn altijd nieuwe mensen online!
              </p>
              <div className="text-sm text-gray-500">
                Gezocht voor {formatTime(searchTime)}
              </div>
            </div>

            {/* Retry button */}
            <button
              onClick={retryMatching}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Opnieuw proberen</span>
            </button>

            {/* Alternative options */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-3">
                Of probeer:
              </p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                  • Verander je persoonlijkheid instelling
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                  • Probeer het later opnieuw
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom animation delays */}
      <style jsx>{`
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}