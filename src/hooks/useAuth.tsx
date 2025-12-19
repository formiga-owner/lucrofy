import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('INVALID_PROFILE');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: data.created_at,
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(setUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true); // Temporarily loading while fetching profile
      if (session?.user) {
        fetchProfile(session.user.id).then((u) => {
          setUser(u);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Login exception:', e);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // This will be used by the trigger to create the profile
          },
        },
      });

      if (error) {
        console.error('Register error:', error.message);
        return false;
      }

      // If session exists immediately (no email confirm), we return true
      if (data.session) {
        return true;
      }

      // If email confirmation is required, usually we still return true but might notify user
      return true;
    } catch (e) {
      console.error('Register exception:', e);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
