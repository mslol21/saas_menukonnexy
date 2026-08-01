'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, Tenant } from '@/types';
import { MOCK_TENANTS } from '@/lib/mock-data';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  userTenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signup: (email: string, pass: string, restaurantName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userTenant, setUserTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initSession() {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfileAndTenant(session.user.id);
          }
        } catch (e) {
          console.error('Session error:', e);
        }
      } else {
        // Fallback for local demo mode: default to Calixto Burger owner
        const mockUser = { id: 'u-1', email: 'proprietario@calixtoburger.com.br' };
        setUser(mockUser);
        setProfile({ id: 'prof-1', user_id: 'u-1', email: mockUser.email, role: 'owner' });
        setUserTenant(MOCK_TENANTS[0]);
      }
      setIsLoading(false);
    }

    initSession();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfileAndTenant(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setUserTenant(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchUserProfileAndTenant = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profData) setProfile(profData as UserProfile);

      // 2. Fetch User's Specific Tenant (Strict Isolation)
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (tenantData) {
        setUserTenant(tenantData as Tenant);
      } else {
        // Fallback to first available or mock
        setUserTenant(MOCK_TENANTS[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch user tenant, fallback to mock:', err);
      setUserTenant(MOCK_TENANTS[0]);
    }
  };

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
    } else {
      // Mock login success
      const mockUser = { id: 'u-1', email };
      setUser(mockUser);
      setProfile({ id: 'prof-1', user_id: 'u-1', email, role: 'owner' });
      setUserTenant(MOCK_TENANTS[0]);
    }
    return {};
  };

  const signup = async (email: string, pass: string, restaurantName: string) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) return { error: error.message };

      if (data.user) {
        const slug = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

        // Insert Tenant linked to auth.uid()
        await supabase.from('tenants').insert({
          owner_id: data.user.id,
          name: restaurantName,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          whatsapp: '5511999999999',
          address: 'Endereço a definir',
          description: `Cardápio digital de ${restaurantName}`,
          subscription_status: 'trial',
        });
      }
    } else {
      const mockUser = { id: `u-${Date.now()}`, email };
      setUser(mockUser);
      const newTenant: Tenant = {
        ...MOCK_TENANTS[0],
        id: `t-${Date.now()}`,
        name: restaurantName,
        slug: restaurantName.toLowerCase().replace(/\s+/g, '-'),
      };
      setUserTenant(newTenant);
    }
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setUserTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userTenant,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
