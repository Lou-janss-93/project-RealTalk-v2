'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { getCurrentUser, isDemoMode, demoSignOut } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });

    if (!isDemoMode) {
      // Only set up auth listener if not in demo mode
      const { supabase } = require('@/lib/supabase');
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: string, session: any) => {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      }
    }
  }, []);

  if (loading) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
              {isDemoMode && (
                <p className="text-sm text-blue-600 mt-2">Demo Mode Active</p>
              )}
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation user={user} />
        {children}
      </body>
    </html>
  );
}