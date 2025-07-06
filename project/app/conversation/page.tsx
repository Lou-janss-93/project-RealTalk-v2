'use client';

import { useSearchParams } from 'next/navigation';
import ConversationScreen from '@/components/ConversationScreen';

export default function ConversationPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');

  return (
    <ConversationScreen 
      matchId={matchId || undefined}
      partnerName="Alex"
      partnerAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    />
  );
}