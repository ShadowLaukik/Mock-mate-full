
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = "moderator" | "participant" | "evaluator";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved user in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("mockmate-user");
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("mockmate-user");
      }
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call your authentication service here
      // For now, we'll just create a mock user
      const newUser: User = {
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        email,
        name,
        role,
      };
      
      // Save user to localStorage for persistence
      localStorage.setItem("mockmate-user", JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Account created",
        description: `Welcome, ${name}! Your account has been created successfully.`,
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create your account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll create a mock user based on the email
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        email,
        name: email.split('@')[0],
        role: email.includes('moderator') 
          ? 'moderator' 
          : email.includes('evaluator') 
            ? 'evaluator' 
            : 'participant',
      };
      
      localStorage.setItem("mockmate-user", JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: "Welcome back!",
        description: `You have successfully signed in as ${mockUser.role}.`,
      });
    } catch (error) {
      console.error("Signin error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in. Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear user from localStorage
      localStorage.removeItem("mockmate-user");
      setUser(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Signout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
