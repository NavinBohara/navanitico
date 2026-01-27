import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchProfile, upsertProfile } from '../lib/profiles';
import { listSavedArticles, listCompletedModules, getGameProgress } from '../lib/userData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completedModules: string[];
  gameProgress: {
    level: number;
    score: number;
    coins: number;
  };
  budgetHistory: any[];
  savedArticles: string[];
}

interface UserContextType {
  user: UserProfile | null;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signUpWithPassword: (email: string, password: string, name?: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  updateProgress: (moduleId: string) => void;
  saveArticle: (articleId: string) => void;
  updateGameProgress: (level: number, score: number, coins: number) => void;
  updateDisplayName?: (name: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Helper to load persisted profile by auth user id
  const loadUserProfile = async (authUserId: string, email: string, nameFallback?: string): Promise<UserProfile> => {
    const key = `navaniti-user-${authUserId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as UserProfile;
    }
    // Try from Supabase profiles table
    try {
      const dbProfile = await fetchProfile(authUserId);
      const [savedArticles, completedModules, gameProgress] = await Promise.all([
        listSavedArticles().catch(() => []),
        listCompletedModules().catch(() => []),
        getGameProgress().catch(() => null)
      ]);
      if (dbProfile) {
        const constructed: UserProfile = {
          id: authUserId,
          name: dbProfile.name || nameFallback || email.split('@')[0],
          email,
          level: 'beginner',
          completedModules,
          gameProgress: gameProgress ?? { level: 1, score: 0, coins: 100 },
          budgetHistory: [],
          savedArticles: savedArticles.map(a => a.article_id)
        };
        localStorage.setItem(key, JSON.stringify(constructed));
        return constructed;
      }
    } catch {}
    const derivedName = nameFallback || email.split('@')[0];
    const newProfile: UserProfile = {
      id: authUserId,
      name: derivedName,
      email,
      level: 'beginner',
      completedModules: [],
      gameProgress: { level: 1, score: 0, coins: 100 },
      budgetHistory: [],
      savedArticles: []
    };
    localStorage.setItem(key, JSON.stringify(newProfile));
    return newProfile;
  };

  // Initialize from Supabase session and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!isMounted) return;
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id, session.user.email || '', session.user.user_metadata?.name);
        if (!isMounted) return;
        setUser(profile);
      } else {
        setUser(null);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id, session.user.email || '', session.user.user_metadata?.name);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, name?: string) => {
    if (name) {
      localStorage.setItem(`navaniti-pending-name-${email}`, name);
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signUpWithPassword = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: name ? { name } : undefined, emailRedirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const updateProgress = async (moduleId: string) => {
    if (!user) return;
    try {
      const { markModuleCompleted } = await import('../lib/userData');
      await markModuleCompleted(moduleId);
    } catch {}
    const updatedUser = {
      ...user,
      completedModules: [...user.completedModules, moduleId]
    };
    setUser(updatedUser);
    localStorage.setItem(`navaniti-user-${user.id}`, JSON.stringify(updatedUser));
  };

  const saveArticle = async (articleId: string) => {
    if (!user) return;
    try {
      const { addSavedArticle } = await import('../lib/userData');
      await addSavedArticle({ article_id: articleId });
    } catch {}
    const updatedUser = {
      ...user,
      savedArticles: [...user.savedArticles, articleId]
    };
    setUser(updatedUser);
    localStorage.setItem(`navaniti-user-${user.id}`, JSON.stringify(updatedUser));
  };

  const updateGameProgress = async (level: number, score: number, coins: number) => {
    if (!user) return;
    try {
      const { upsertGameProgress } = await import('../lib/userData');
      await upsertGameProgress(level, score, coins);
      console.log('Game progress saved to database');
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
    const updatedUser = {
      ...user,
      gameProgress: { level, score, coins }
    };
    setUser(updatedUser);
    localStorage.setItem(`navaniti-user-${user.id}`, JSON.stringify(updatedUser));
  };

  // Expose a method to update display name in Supabase as well (used by Profile screen)
  const updateDisplayName = async (name: string) => {
    if (!user) return;
    await upsertProfile(user.id, { name });
    const updatedUser = { ...user, name };
    setUser(updatedUser);
    localStorage.setItem(`navaniti-user-${user.id}`, JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      signInWithProvider,
      signUpWithPassword,
      signInWithPassword,
      updateProgress,
      saveArticle,
      updateGameProgress,
      updateDisplayName
    }}>
      {children}
    </UserContext.Provider>
  );
};