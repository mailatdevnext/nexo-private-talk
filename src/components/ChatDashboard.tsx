
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Search, MessageCircle, Users } from "lucide-react";
import { UserSearch } from "./UserSearch";
import { ConversationsList } from "./ConversationsList";
import { ChatWindow } from "./ChatWindow";
import { useToast } from "@/hooks/use-toast";

interface ChatDashboardProps {
  user: User;
}

export const ChatDashboard = ({ user }: ChatDashboardProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex bg-black">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">NEXO</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
            className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Find Users
          </Button>
        </div>

        {/* User Search */}
        {showSearch && (
          <div className="p-4 border-b border-gray-800 bg-gray-800/50">
            <UserSearch 
              currentUserId={user.id} 
              onConversationCreated={(conversationId) => {
                setSelectedConversationId(conversationId);
                setShowSearch(false);
              }}
            />
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationsList 
            currentUserId={user.id}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow 
            conversationId={selectedConversationId}
            currentUserId={user.id}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Welcome to NEXO</p>
              <p className="text-sm opacity-60">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
