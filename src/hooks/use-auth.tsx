
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// Mock User type, simplified from Firebase User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// In-memory store for mock users
const mockUsers: { [email: string]: { password: string; user: User } } = {};
// Store the current user in a global variable to persist across renders in development
let globalUser: User | null = null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state on load
    const timeout = setTimeout(() => {
      setUser(globalUser);
      setLoading(false);
    }, 500); // Simulate a short loading delay

    return () => clearTimeout(timeout);
  }, []);

  const signInWithGoogle = async () => {
    throw new Error('Google Sign-In is disabled in mock mode.');
  };

  const signInWithEmail = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const storedUser = mockUsers[email];
        if (storedUser && storedUser.password === password) {
          globalUser = storedUser.user;
          setUser(globalUser);
          resolve();
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 1000); // Simulate network latency
    });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          reject(new Error('Email is already in use.'));
          return;
        }
        const newUser: User = {
          uid: `mock_${Date.now()}`,
          email: email,
          displayName: email.split('@')[0],
        };
        mockUsers[email] = { password, user: newUser };
        globalUser = newUser;
        setUser(globalUser);
        console.log('Mock users:', mockUsers);
        resolve();
      }, 1000);
    });
  };

  const signOut = () => {
    globalUser = null;
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    signInWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
