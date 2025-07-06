'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Users, ArrowLeft } from 'lucide-react';
import { supabase, demoSignIn, isDemoMode, getProfile } from '@/lib/supabase';
import { Language, useTranslation, getStoredLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const router = useRouter();
  const t = useTranslation(language);

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isDemoMode) {
        // Demo mode login
        const { user } = await demoSignIn(email, password);
        
        // Check if user has completed onboarding
        const personality = localStorage.getItem('userPersonality');
        if (personality) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        // Real Supabase login
        const { data, error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user has completed onboarding
          const profile = await getProfile(data.user.id);

          if (profile?.personality_type) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    } catch (error: any) {
      setError(error.message || (language === 'en' 
        ? 'An error occurred during login' 
        : 'Er is een fout opgetreden bij het inloggen'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector 
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.auth.backToHome}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.auth.welcomeBack}
          </h1>
          <p className="text-gray-600">
            {t.auth.loginToContinue}
          </p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Use any email/password to login and explore the platform.
              </p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="je@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {!isDemoMode && (
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t.auth.login
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.auth.noAccount}{' '}
              <Link 
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t.auth.registerHere}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Account */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>{t.auth.demoAccount}</strong><br />
            Email: demo@realtalk.com<br />
            {t.auth.password}: demo123
          </p>
        </div>
      </div>
    </div>
  );
}