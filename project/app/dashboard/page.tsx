'use client';

import { useEffect, useState } from 'react';
import { User, VenetianMask as Mask, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [userPersonality, setUserPersonality] = useState<string | null>(null);

  useEffect(() => {
    const personality = localStorage.getItem('userPersonality');
    setUserPersonality(personality);
  }, []);

  const getPersonalityInfo = (personality: string | null) => {
    switch (personality) {
      case 'real-me':
        return {
          title: 'Real Me',
          icon: User,
          color: 'from-blue-500 to-indigo-600',
          description: 'Welcome to your authentic space!'
        };
      case 'my-mask':
        return {
          title: 'My Mask',
          icon: Mask,
          color: 'from-purple-500 to-violet-600',
          description: 'Ready to present your best self!'
        };
      case 'crazy-self':
        return {
          title: 'Crazy Self',
          icon: Zap,
          color: 'from-orange-500 to-pink-600',
          description: 'Time to unleash your wild side!'
        };
      default:
        return {
          title: 'Welcome',
          icon: User,
          color: 'from-gray-500 to-gray-600',
          description: 'Get started by choosing your persona!'
        };
    }
  };

  const personalityInfo = getPersonalityInfo(userPersonality);
  const IconComponent = personalityInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${personalityInfo.color} rounded-full mb-6`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {personalityInfo.title} Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            {personalityInfo.description}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Personality Choice
          </h2>
          <p className="text-gray-600 mb-6">
            You selected <strong>{personalityInfo.title}</strong> as your persona. 
            This will customize your experience throughout the platform.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Next Steps
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Complete your profile setup</li>
              <li>• Connect with others who share your vibe</li>
              <li>• Start sharing content in your chosen style</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}