'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  MessageCircle,
  Mic,
  Bell
} from 'lucide-react';
import { supabase, demoSignOut, isDemoMode } from '@/lib/supabase';
import { Language, useTranslation, getStoredLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

interface NavigationProps {
  user?: any;
}

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslation(language);

  // Don't show navigation on landing page or auth pages
  const hideNavigation = pathname === '/' || pathname.startsWith('/auth') || pathname === '/onboarding';

  useEffect(() => {
    setLanguage(getStoredLanguage());
    // Simulate notifications
    setNotifications(Math.floor(Math.random() * 5));
  }, []);

  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
        await demoSignOut();
      } else {
        await supabase?.auth.signOut();
      }
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (hideNavigation) return null;

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: Home },
    { href: '/feed', label: t.posts.feedTitle, icon: MessageCircle },
    { href: '/matching', label: t.nav.findMatch, icon: Users },
    { href: '/conversations', label: t.nav.conversations, icon: MessageCircle },
    { href: '/voice-capture', label: t.nav.voiceSetup, icon: Mic },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center glow-blue floating-element">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-blue">RealTalk</span>
              {isDemoMode && (
                <span className="px-2 py-1 glass-button text-blue-800 text-xs rounded-full font-medium">
                  Demo
                </span>
              )}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 floating-element ${
                      isActive 
                        ? 'glass-strong text-blue-700 glow-blue' 
                        : 'text-gray-600 hover:text-gray-900 glass-button'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 glass-button rounded-xl transition-all duration-300 floating-element">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-slow">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-xl glass-button transition-all duration-300 floating-element">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center glow-purple">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.email || 'Demo User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 glass-card rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 floating-element">
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-white/50 transition-all duration-300 rounded-xl mx-2"
                    >
                      <User className="w-4 h-4" />
                      <span>{t.nav.profile}</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-white/50 transition-all duration-300 rounded-xl mx-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t.nav.settings}</span>
                    </Link>
                    <hr className="my-2 border-white/30" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50/50 transition-all duration-300 w-full text-left rounded-xl mx-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 glass-button rounded-xl transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card border-t border-white/30">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'glass-strong text-blue-700 glow-blue' 
                        : 'text-gray-600 hover:text-gray-900 glass-button'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <hr className="my-4 border-white/30" />
              
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 glass-button rounded-xl transition-all duration-300"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t.nav.profile}</span>
              </Link>
              
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 glass-button rounded-xl transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">{t.nav.settings}</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-300 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t.nav.logout}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}