'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';

interface WebRTCConnectionProps {
  matchId: string;
  isInitiator: boolean;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onAudioLevelChange?: (level: number) => void;
  className?: string;
}

export default function WebRTCConnection({
  matchId,
  isInitiator,
  onConnectionStateChange,
  onAudioLevelChange,
  className = ''
}: WebRTCConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [audioLevel, setAudioLevel] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // WebSocket for signaling (in production, use your signaling server)
  const wsRef = useRef<WebSocket | null>(null);

  // ICE servers configuration
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // Initialize WebRTC connection
  const initializeConnection = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      localStreamRef.current = stream;

      // Setup audio analysis
      setupAudioAnalysis(stream);

      // Create peer connection
      const peerConnection = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setConnectionState(state);
        setIsConnected(state === 'connected');
        onConnectionStateChange?.(state);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            matchId
          }));
        }
      };

      // Setup signaling
      setupSignaling();

      // If initiator, create offer
      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            offer,
            matchId
          }));
        }
      }

    } catch (error) {
      console.error('Error initializing WebRTC connection:', error);
    }
  }, [matchId, isInitiator, onConnectionStateChange]);

  // Setup WebSocket signaling
  const setupSignaling = useCallback(() => {
    // In production, replace with your signaling server URL
    const wsUrl = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:3002';
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Signaling connection established');
        ws.send(JSON.stringify({ type: 'join', matchId }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const peerConnection = peerConnectionRef.current;
        
        if (!peerConnection) return;

        switch (message.type) {
          case 'offer':
            await peerConnection.setRemoteDescription(message.offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            ws.send(JSON.stringify({
              type: 'answer',
              answer,
              matchId
            }));
            break;

          case 'answer':
            await peerConnection.setRemoteDescription(message.answer);
            break;

          case 'ice-candidate':
            await peerConnection.addIceCandidate(message.candidate);
            break;

          case 'mute-status':
            setIsRemoteMuted(message.isMuted);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('Signaling error:', error);
      };

      ws.onclose = () => {
        console.log('Signaling connection closed');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      // Fallback to demo mode without real WebRTC
    }
  }, [matchId]);

  // Setup audio level analysis
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      const analyzeAudio = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = average / 255;
        
        setAudioLevel(normalizedLevel);
        onAudioLevelChange?.(normalizedLevel);
        
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };
      
      analyzeAudio();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  }, [onAudioLevelChange]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Notify remote peer
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'mute-status',
            isMuted: !audioTrack.enabled,
            matchId
          }));
        }
      }
    }
  }, [matchId]);

  // End call
  const endCall = useCallback(() => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsConnected(false);
    setConnectionState('closed');
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeConnection();

    return () => {
      endCall();
    };
  }, [initializeConnection, endCall]);

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'new':
      case 'connecting':
        return 'Verbinden...';
      case 'connected':
        return 'Verbonden';
      case 'disconnected':
        return 'Verbinding verbroken';
      case 'failed':
        return 'Verbinding mislukt';
      case 'closed':
        return 'Gesprek beëindigd';
      default:
        return 'Onbekende status';
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl p-8 ${className}`}>
      {/* Connection Status */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : connectionState === 'connecting' 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          } ${isConnected ? 'animate-pulse' : ''}`} />
          <span>{getConnectionStatusText()}</span>
        </div>
      </div>

      {/* Audio Visualization */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {/* Local Audio */}
        <div className="text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
            isMuted ? 'bg-red-100' : 'bg-green-100'
          }`} style={{
            transform: `scale(${1 + (isMuted ? 0 : audioLevel * 0.3)})`
          }}>
            {isMuted ? (
              <MicOff className="w-8 h-8 text-red-500" />
            ) : (
              <Mic className="w-8 h-8 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">Jij</p>
        </div>

        {/* Connection Indicator */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse animation-delay-200" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse animation-delay-400" />
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
            </>
          )}
        </div>

        {/* Remote Audio */}
        <div className="text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${
            isRemoteMuted ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isRemoteMuted ? (
              <VolumeX className="w-8 h-8 text-red-500" />
            ) : (
              <Volume2 className="w-8 h-8 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">Partner</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={toggleMicrophone}
          className={`p-4 rounded-full transition-all duration-300 ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Hidden audio elements */}
      <audio ref={localAudioRef} muted autoPlay />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Status Text */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          {isMuted ? 'Microfoon uitgeschakeld' : isConnected ? 'Audio actief' : 'Wachten op verbinding...'}
        </p>
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}