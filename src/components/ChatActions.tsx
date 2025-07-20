
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserX, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatActionsProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  currentUserId: string;
  onConversationDeleted: () => void;
  onUserBlocked: () => void;
}

export const ChatActions = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  currentUserId,
  onConversationDeleted,
  onUserBlocked 
}: ChatActionsProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteConversation = async () => {
    if (!confirm("Are you sure you want to permanently delete this conversation? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      // First, delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted.",
      });
      
      onConversationDeleted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async () => {
    if (!confirm(`Are you sure you want to block ${otherUserName}? They will no longer be able to send you messages.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: currentUserId,
          blocked_id: otherUserId
        });

      if (error) throw error;

      toast({
        title: "User blocked",
        description: `${otherUserName} has been blocked.`,
      });

      onUserBlocked();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        <DropdownMenuItem
          onClick={blockUser}
          disabled={loading}
          className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-700"
        >
          <UserX className="h-4 w-4 mr-2" />
          Block User
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={deleteConversation}
          disabled={loading}
          className="text-red-400 hover:text-red-300 hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
