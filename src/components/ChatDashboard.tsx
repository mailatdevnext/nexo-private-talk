
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Search, MessageCircle } from "lucide-react";
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
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600">NEXO</h1>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSearch(!showSearch)}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Users
            </Button>
          </div>
        </div>

        {/* User Search */}
        {showSearch && (
          <div className="p-4 border-b border-gray-200">
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
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
