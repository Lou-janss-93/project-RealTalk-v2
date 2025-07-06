'use client';

import VoiceCapture from '@/components/VoiceCapture';
import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function VoiceCapturePage() {
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    duration: number;
    url: string;
  } | null>(null);

  const handleAudioRecorded = (audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    setRecordedAudio({
      blob: audioBlob,
      duration,
      url: audioUrl
    });

    // Here you would typically upload to Supabase Storage or process for analysis
    console.log('Audio recorded:', {
      size: audioBlob.size,
      duration,
      type: audioBlob.type
    });
  };

  const handleError = (error: string) => {
    console.error('Voice capture error:', error);
    // You could show a toast notification here
  };

  const downloadRecording = () => {
    if (recordedAudio) {
      const a = document.createElement('a');
      a.href = recordedAudio.url;
      a.download = `voice-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Stem Verificatie
              </h1>
              <p className="text-sm text-gray-600">
                Neem je stem op voor authenticatie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Voice Capture Component */}
          <VoiceCapture
            onAudioRecorded={handleAudioRecorded}
            onError={handleError}
            maxDuration={30}
            className="py-12"
          />

          {/* Recorded Audio Playback */}
          {recordedAudio && (
            <div className="border-t border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Opname Voltooid
                </h3>
                
                <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Duur:</span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(recordedAudio.duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Grootte:</span>
                    <span className="font-medium text-gray-900">
                      {(recordedAudio.blob.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Audio Player */}
                  <audio 
                    controls 
                    src={recordedAudio.url}
                    className="w-full mb-4"
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadRecording}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={() => setRecordedAudio(null)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Opnieuw opnemen
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Volgende stap:</strong> Je stem wordt geanalyseerd voor authenticatie. 
                    Dit proces kan enkele seconden duren.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tips voor een goede opname
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Zorg voor een rustige omgeving zonder achtergrondgeluid</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Spreek duidelijk en in een normaal tempo</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Houd je apparaat op ongeveer 15-20 cm afstand</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>De opname duurt maximaal 30 seconden</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}