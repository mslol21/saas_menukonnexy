'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, Tenant } from '@/types';
import { MOCK_TENANTS } from '@/lib/mock-data';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  userTenant: Tenant | null;
  setUserTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  updateUserTenant: (updated: Tenant) => Promise<void>;
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
      const savedTenant = typeof window !== 'undefined' ? localStorage.getItem('konnexy_user_tenant') : null;
      const parsedSavedTenant = savedTenant ? JSON.parse(savedTenant) : null;

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfileAndTenant(session.user.id, session.user.email, parsedSavedTenant);
          } else if (parsedSavedTenant) {
            setUser({ id: parsedSavedTenant.owner_id || 'u-custom', email: 'proprietario@konnexy.com.br' });
            setUserTenant(parsedSavedTenant);
          }
        } catch (e) {
          console.warn('Session error:', e);
          if (parsedSavedTenant) setUserTenant(parsedSavedTenant);
        }
      } else {
        if (parsedSavedTenant) {
          setUser({ id: parsedSavedTenant.owner_id || 'u-custom', email: 'proprietario@konnexy.com.br' });
          setProfile({ id: 'prof-1', user_id: 'u-custom', email: 'proprietario@konnexy.com.br', role: 'owner' });
          setUserTenant(parsedSavedTenant);
        }
      }
      setIsLoading(false);
    }

    initSession();

    if (isSupabaseConfigured()) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfileAndTenant(session.user.id, session.user.email, null);
          }
          setIsLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Auth state listener error:', err);
      }
    }
  }, []);

  const fetchUserProfileAndTenant = async (userId: string, userEmail?: string, localFallback?: Tenant | null) => {
    try {
      // 1. Fetch Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profData) setProfile(profData as UserProfile);

      // 2. Fetch User's Specific Tenant
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tenantData) {
        setUserTenant(tenantData as Tenant);
        if (typeof window !== 'undefined') {
          localStorage.setItem('konnexy_user_tenant', JSON.stringify(tenantData));
        }
      } else if (localFallback) {
        setUserTenant(localFallback);
      } else {
        // Create user-specific tenant instance so it NEVER falls back to Calixto Burger demo
        const defaultUserTenant: Tenant = {
          id: `t-${userId.slice(0, 8)}`,
          owner_id: userId,
          name: 'Meu Novo Restaurante',
          slug: `restaurante-${userId.slice(0, 6)}`,
          logo_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
          banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=500&fit=crop',
          description: 'Cardápio digital inteligente personalizado.',
          phone: '(11) 99999-8888',
          whatsapp: '5511999998888',
          address: 'Endereço a definir no painel',
          opening_hours: { mon_fri: '11:00 - 23:00', sat_sun: '12:00 - 00:00' },
          subscription_status: 'active',
          subscription_plan: 'monthly',
          expires_at: '2027-12-31T23:59:59.000Z',
          theme_config: { primary_color: '#FF5722', mode: 'dark', style: 'glass' },
          created_at: new Date().toISOString(),
        };

        setUserTenant(defaultUserTenant);
        if (typeof window !== 'undefined') {
          localStorage.setItem('konnexy_user_tenant', JSON.stringify(defaultUserTenant));
        }

        // Try DB creation in Supabase
        await supabase.from('tenants').insert({
          owner_id: userId,
          name: defaultUserTenant.name,
          slug: defaultUserTenant.slug,
          whatsapp: defaultUserTenant.whatsapp,
        });
      }
    } catch (err) {
      if (localFallback) setUserTenant(localFallback);
    }
  };

  const updateUserTenant = async (updated: Tenant) => {
    setUserTenant(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('konnexy_user_tenant', JSON.stringify(updated));
    }

    if (isSupabaseConfigured() && updated.id) {
      try {
        await supabase.from('tenants').upsert(updated);
      } catch (err) {
        console.error('Failed to sync tenant update to Supabase:', err);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          // If login error, set local user state
          const mockUser = { id: `u-${email.replace(/[^a-zA-Z0-9]/g, '')}`, email };
          setUser(mockUser);
          await fetchUserProfileAndTenant(mockUser.id, email, null);
          return {};
        }
        if (data?.user) {
          setUser(data.user);
          await fetchUserProfileAndTenant(data.user.id, data.user.email, null);
        }
      } catch (err: any) {
        console.warn('Supabase login notice:', err);
      }
    } else {
      const mockUser = { id: `u-${email.replace(/[^a-zA-Z0-9]/g, '')}`, email };
      setUser(mockUser);
      setProfile({ id: 'prof-logged', user_id: mockUser.id, email, role: 'owner' });
    }
    return {};
  };

  const signup = async (email: string, pass: string, restaurantName: string) => {
    const slugBase = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const cleanSlug = `${slugBase || 'restaurante'}-${Date.now().toString().slice(-4)}`;

    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      owner_id: 'u-new',
      name: restaurantName,
      slug: cleanSlug,
      logo_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
      banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=500&fit=crop',
      description: `Cardápio digital inteligente de ${restaurantName}`,
      phone: '(11) 99999-8888',
      whatsapp: '5511999998888',
      address: 'Endereço a definir no painel',
      opening_hours: { mon_fri: '11:00 - 23:00', sat_sun: '12:00 - 00:00' },
      subscription_status: 'active',
      subscription_plan: 'monthly',
      expires_at: '2027-12-31T23:59:59.000Z',
      theme_config: { primary_color: '#FF5722', mode: 'dark', style: 'glass' },
      created_at: new Date().toISOString(),
    };

    const ownerId = `u-${Date.now()}`;
    newTenant.owner_id = ownerId;

    setUser({ id: ownerId, email });
    setProfile({ id: `prof-${Date.now()}`, user_id: ownerId, email, role: 'owner' });
    setUserTenant(newTenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('konnexy_user_tenant', JSON.stringify(newTenant));
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              restaurant_name: restaurantName,
            },
          },
        });

        if (data?.user) {
          newTenant.owner_id = data.user.id;
          setUser(data.user);
          localStorage.setItem('konnexy_user_tenant', JSON.stringify(newTenant));

          // Also attempt immediate sign in
          await supabase.auth.signInWithPassword({ email, password: pass });

          // Direct insert backup
          await supabase.from('tenants').insert({
            owner_id: data.user.id,
            name: restaurantName,
            slug: cleanSlug,
            whatsapp: '5511999998888',
            description: `Cardápio digital inteligente de ${restaurantName}`,
            address: 'Endereço a definir no painel',
          });
        }
      } catch (err) {
        console.warn('Supabase signup notice:', err);
      }
    }

    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    setProfile(null);
    setUserTenant(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('konnexy_user_tenant');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userTenant,
        setUserTenant,
        updateUserTenant,
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
