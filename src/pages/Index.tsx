
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/lib/types";
import { AuthPage } from "@/components/AuthPage";
import { ChatDashboard } from "@/components/ChatDashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const convertSupabaseUserToUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    // Try to get profile data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        setSession(session);
        
        if (session?.user) {
          const convertedUser = await convertSupabaseUserToUser(session.user);
          setUser(convertedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const convertedUser = await convertSupabaseUserToUser(session.user);
        setUser(convertedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading NEXO...</div>
      </div>
    );
  }

  if (!user || !session) {
    return <AuthPage />;
  }

  return <ChatDashboard user={user} />;
};

export default Index;
