'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, VenetianMask as Mask, Zap, ArrowRight } from 'lucide-react';
import { Language, useTranslation, getStoredLanguage } from '@/lib/i18n';

interface PersonalityOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  hoverGradient: string;
}

export default function OnboardingPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const router = useRouter();
  const t = useTranslation(language);

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  const personalityOptions: PersonalityOption[] = [
    {
      id: 'roots',
      title: t.onboarding.rootsTitle,
      description: t.onboarding.rootsDesc,
      icon: User,
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      hoverGradient: 'from-blue-400 via-blue-500 to-indigo-600'
    },
    {
      id: 'mask',
      title: t.onboarding.maskTitle,
      description: t.onboarding.maskDesc,
      icon: Mask,
      gradient: 'from-purple-500 via-violet-600 to-purple-700',
      hoverGradient: 'from-purple-400 via-violet-500 to-purple-600'
    },
    {
      id: 'spark',
      title: t.onboarding.sparkTitle,
      description: t.onboarding.sparkDesc,
      icon: Zap,
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      hoverGradient: 'from-orange-400 via-red-400 to-pink-500'
    }
  ];

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOption(optionId);
    setIsNavigating(true);

    // Store the choice in localStorage
    localStorage.setItem('userPersonality', optionId);

    // Simulate a brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    // Navigate to the next step
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.onboarding.choosePersona}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.onboarding.chooseDescription}
          </p>
        </div>

        {/* Personality Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {personalityOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption === option.id;
            const isOtherSelected = selectedOption && selectedOption !== option.id;

            return (
              <div
                key={option.id}
                onClick={() => !isNavigating && handleOptionSelect(option.id)}
                className={`
                  relative group cursor-pointer transition-all duration-500 ease-out
                  ${isSelected ? 'scale-105 z-10' : ''}
                  ${isOtherSelected ? 'scale-95 opacity-60' : ''}
                  ${isNavigating ? 'pointer-events-none' : ''}
                `}
              >
                <div className={`
                  relative overflow-hidden rounded-3xl p-8 h-80 
                  bg-gradient-to-br ${isSelected ? option.hoverGradient : option.gradient}
                  shadow-xl hover:shadow-2xl transition-all duration-500
                  transform hover:scale-105 hover:-translate-y-2
                  border border-white/20
                `}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20" />
                    <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {option.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 leading-relaxed flex-grow">
                      {option.description}
                    </p>

                    {/* Selection Indicator */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-white/80 text-sm font-medium">
                        {t.onboarding.clickToSelect}
                      </span>
                      <div className={`
                        transition-all duration-300 transform
                        ${isSelected ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                      `}>
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>{t.onboarding.stepOf}</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
        </div>

        {/* Navigation State Message */}
        {isNavigating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t.onboarding.greatChoice}
              </h3>
              <p className="text-gray-600">
                {t.onboarding.settingUp}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}