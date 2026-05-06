import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "farmer";

export interface AuthUser {
  id: string;
  role: UserRole;
  displayName: string;
  location?: string;
  phone?: string;
  farmerId?: string; // farmers table id
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  loginAsAdmin: (password: string) => string | null;
  signup: (email: string, password: string, name: string, location: string, phone: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => "Not initialized",
  loginAsAdmin: () => "Not initialized",
  signup: async () => "Not initialized",
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_PASSWORD = "admin123";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFarmerProfile = async (supaUser: SupabaseUser): Promise<AuthUser | null> => {
    const { data } = await supabase
      .from("farmers")
      .select("*")
      .eq("user_id", supaUser.id)
      .maybeSingle();

    if (!data) return null;
    return {
      id: supaUser.id,
      role: "farmer",
      displayName: data.name,
      location: data.location,
      phone: data.phone,
      farmerId: data.id,
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchFarmerProfile(session.user);
        if (profile) {
          setUser(profile);
        }
      } else {
        // Don't clear admin user on auth state change
        setUser(prev => prev?.role === "admin" ? prev : null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchFarmerProfile(session.user);
        if (profile) setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsAdmin = (password: string): string | null => {
    if (password !== ADMIN_PASSWORD) return "Incorrect admin password";
    setUser({
      id: "admin",
      role: "admin",
      displayName: "Admin Panel",
    });
    return null;
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const signup = async (email: string, password: string, name: string, location: string, phone: string): Promise<string | null> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return authError.message;
    if (!authData.user) return "Signup failed";

    const { error: profileError } = await supabase.from("farmers").insert({
      user_id: authData.user.id,
      name,
      location,
      phone,
    });
    if (profileError) return profileError.message;
    return null;
  };

  const logout = async () => {
    if (user?.role === "admin") {
      setUser(null);
    } else {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsAdmin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
