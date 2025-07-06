'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VoiceCaptureProps {
  onAudioRecorded?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

export default function VoiceCapture({
  onAudioRecorded,
  onError,
  maxDuration = 60,
  className = ''
}: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (error) {
      setHasPermission(false);
      onError?.('Microfoon toegang geweigerd. Geef toestemming om door te gaan.');
    }
  }, [onError]);

  // Initialize audio context and analyser for waveform visualization
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      return stream;
    } catch (error) {
      onError?.('Kon geen toegang krijgen tot de microfoon.');
      throw error;
    }
  }, [onError]);

  // Animate audio level visualization
  const animateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average audio level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    animationRef.current = requestAnimationFrame(animateAudioLevel);
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      setRecordingComplete(false);
      
      const stream = await initializeAudioContext();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded?.(audioBlob, recordingTime);
        setRecordingComplete(true);
        setIsProcessing(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setIsProcessing(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start audio level animation
      animateAudioLevel();
    } catch (error) {
      setIsProcessing(false);
      onError?.('Kon opname niet starten.');
    }
  }, [initializeAudioContext, onAudioRecorded, recordingTime, maxDuration, animateAudioLevel, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clean up
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [isRecording]);

  // Handle record button click
  const handleRecordClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-96 p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Microfoon toegang vereist
          </h3>
          <p className="text-gray-600 mb-6">
            We hebben toegang tot je microfoon nodig om je stem op te nemen. 
            Klik op "Toestaan" in je browser.
          </p>
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Microfoon toegang controleren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-96 p-8 ${className}`}>
      <div className="text-center max-w-md mx-auto">
        {/* Instruction Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stem Opname
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Houd de knop ingedrukt en praat – we nemen je stem op
        </p>

        {/* Waveform Visualization */}
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto">
            {/* Outer pulse ring */}
            <div className={`
              absolute inset-0 rounded-full border-4 transition-all duration-300
              ${isRecording 
                ? 'border-red-300 animate-pulse scale-110' 
                : 'border-gray-200'
              }
            `} />
            
            {/* Middle ring with audio level */}
            <div className={`
              absolute inset-4 rounded-full transition-all duration-150
              ${isRecording 
                ? 'bg-red-100' 
                : 'bg-gray-50'
              }
            `} 
            style={{
              transform: isRecording ? `scale(${1 + audioLevel * 0.3})` : 'scale(1)'
            }} />
            
            {/* Record Button */}
            <button
              onClick={handleRecordClick}
              disabled={isProcessing}
              className={`
                absolute inset-8 rounded-full transition-all duration-300 transform
                flex items-center justify-center font-medium text-white
                hover:scale-105 active:scale-95 disabled:opacity-50
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
                }
                ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>
          </div>
        </div>

        {/* Recording Status */}
        <div className="space-y-4">
          {isRecording && (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-medium">
                Opname bezig... {formatTime(recordingTime)}
              </span>
              <Volume2 className="w-5 h-5 text-red-500" />
            </div>
          )}

          {recordingComplete && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Opname voltooid!</span>
            </div>
          )}

          {!isRecording && !recordingComplete && !isProcessing && (
            <p className="text-gray-500 text-sm">
              Klik op de microfoon om te beginnen
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isRecording && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Maximale duur: {formatTime(maxDuration)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}