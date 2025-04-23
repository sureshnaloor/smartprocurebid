"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string, companyName: string) => Promise<void>;
  logout: () => void;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          // Use the user data from the session instead of making an additional database call
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name,
            role: session.user.user_metadata.role,
            companyName: session.user.user_metadata.company_name,
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role,
          companyName: session.user.user_metadata.company_name,
        });
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email for the confirmation link before logging in.');
        }
        throw error;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
          role: data.user.user_metadata.role,
          companyName: data.user.user_metadata.company_name,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error resending confirmation:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
    companyName: string
  ) => {
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            company_name: companyName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              name,
              role,
              company_name: companyName,
            },
          ]);

        if (profileError) throw profileError;

        // If role is vendor, create a vendor profile
        if (role === 'vendor') {
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert([
              {
                id: authData.user.id,
                email,
                company_name: companyName,
                contact_name: name,
              },
            ]);

          if (vendorError) throw vendorError;
        }

        // Show success message and redirect to confirmation page
        router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the user state
      setUser(null);
      
      // Force a hard navigation to ensure all state is cleared
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  );
}
