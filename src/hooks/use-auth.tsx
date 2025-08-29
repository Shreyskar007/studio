
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// Use a subset of the Firebase User type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory store for mock users
const mockUsers: { [email: string]: { password: string, user: User } } = {};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Set to false to avoid loading screen
  const router = useRouter();

  // This effect will run once on mount to check for a logged-in user in session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);


  const signInWithGoogle = async () => {
    return Promise.reject(new Error("Google Sign-In is temporarily disabled."));
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'shrey@gmail.com' && password === '1111') {
          const loggedInUser: User = {
            uid: 'mock-uid-shrey',
            email: 'shrey@gmail.com',
            displayName: 'Shrey (Test)',
          };
          setUser(loggedInUser);
          sessionStorage.setItem('mockUser', JSON.stringify(loggedInUser));
          resolve();
        } else {
          const existingUser = mockUsers[email];
          if (existingUser && existingUser.password === password) {
            setUser(existingUser.user);
            sessionStorage.setItem('mockUser', JSON.stringify(existingUser.user));
            resolve();
          } else {
             reject(new Error('Invalid email or password.'));
          }
        }
        setLoading(false);
      }, 500); // Simulate network latency
    });
  };

  const signUpWithEmail = async (email: string, password: string) => {
     setLoading(true);
     return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (mockUsers[email] || email === 'shrey@gmail.com') {
                reject(new Error('This email is already in use.'));
            } else {
                const newUser: User = {
                    uid: `mock-uid-${Math.random().toString(36).substring(7)}`,
                    email: email,
                    displayName: email,
                };
                mockUsers[email] = { password, user: newUser };
                setUser(newUser);
                sessionStorage.setItem('mockUser', JSON.stringify(newUser));
                resolve();
            }
            setLoading(false);
        }, 500);
     });
  };

  const signOut = () => {
    setUser(null);
    sessionStorage.removeItem('mockUser');
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
