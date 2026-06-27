import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  profile_image_url?: string;
  user_role?: 'individual' | 'trustee';
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  currentView: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base';
  setCurrentView: (view: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => void;
  refreshProfile: () => Promise<void>;
  isTrustee: boolean;
  logout: () => Promise<void>;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showSignup: boolean;
  setShowSignup: (show: boolean) => void;
  authInitialized: boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  user: null,
  setUser: () => {},
  userProfile: null,
  setUserProfile: () => {},
  currentView: 'home',
  setCurrentView: () => {},
  refreshProfile: async () => {},
  isTrustee: false,
  logout: async () => {},
  showLogin: false,
  setShowLogin: () => {},
  showSignup: false,
  setShowSignup: () => {},
  authInitialized: false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base'>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const mountedRef = useRef(true);

  const isTrustee = userProfile?.user_role === 'trustee';

  const fetchUserProfile = useCallback(async (userId: string, authUser?: User) => {
    if (!mountedRef.current) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile row — auto-create one for accounts predating the profiles table
        const email = authUser?.email || '';
        const fullName = authUser?.user_metadata?.full_name || '';
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            email,
            full_name: fullName,
            display_name: fullName,
            user_role: 'individual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
          .select()
          .single();
        if (newProfile && mountedRef.current) {
          setUserProfile(newProfile);
        }
        return;
      }

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data && mountedRef.current) {
        // Fix NULL user_role for profiles created before the role column existed
        if (!data.user_role) {
          await supabase
            .from('user_profiles')
            .update({ user_role: 'individual', updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          setUserProfile({ ...data, user_role: 'individual' });
        } else {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && mountedRef.current) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  const logout = useCallback(async () => {
    // Clear state immediately so the UI responds even if signOut is slow/hangs
    if (mountedRef.current) {
      setUser(null);
      setUserProfile(null);
      setCurrentView('home');
    }
    supabase.auth.signOut().catch(err => console.error('SignOut error:', err));
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Only set user state from onAuthStateChange so we never trigger database
    // queries before the Supabase client has finished its internal _initialize
    // (which validates/refreshes the token). INITIAL_SESSION fires once that is done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setCurrentView('home');
        setAuthInitialized(true);
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          if (event !== 'TOKEN_REFRESHED') {
            // IMPORTANT: Do NOT await Supabase calls directly inside this callback.
            // supabase-js invokes onAuthStateChange while holding its internal auth
            // lock (Web Locks API). Any Supabase query awaited here needs that same
            // lock and deadlocks — which on a page refresh (INITIAL_SESSION) wedges
            // the profile fetch and every subsequent query (documents, uploads) until
            // they time out. Defer the fetch so it runs after the lock is released.
            const authUser = session.user;
            setTimeout(() => {
              if (mountedRef.current) {
                fetchUserProfile(authUser.id, authUser);
              }
            }, 0);
          }
        } else if (event === 'INITIAL_SESSION') {
          setUser(null);
        }
        if (event === 'INITIAL_SESSION') {
          setAuthInitialized(true);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        user,
        setUser,
        userProfile,
        setUserProfile,
        currentView,
        setCurrentView,
        refreshProfile,
        isTrustee,
        logout,
        showLogin,
        setShowLogin,
        showSignup,
        setShowSignup,
        authInitialized,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
