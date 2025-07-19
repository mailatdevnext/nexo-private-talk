
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  updated_at: string;
  other_user: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
    message_type: 'text' | 'sticker' | 'gif';
  } | null;
}

interface ConversationsListProps {
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationsList = ({ 
  currentUserId, 
  selectedConversationId, 
  onSelectConversation 
}: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to new conversations
    const conversationsSubscription = supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .subscribe();

    // Subscribe to new messages to update last message
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(*),
          participant2:profiles!conversations_participant2_id_fkey(*)
        `)
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMessage, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, message_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (messageError) {
            console.error('Error fetching last message:', messageError);
          }

          const otherUser = conv.participant1_id === currentUserId 
            ? conv.participant2 
            : conv.participant1;

          return {
            ...conv,
            other_user: otherUser,
            last_message: lastMessage ? {
              ...lastMessage,
              message_type: (lastMessage.message_type || 'text') as 'text' | 'sticker' | 'gif'
            } : null
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLastMessage = (message: Conversation['last_message']) => {
    if (!message) return 'No messages yet';
    
    const prefix = message.sender_id === currentUserId ? 'You: ' : '';
    
    if (message.message_type === 'sticker') {
      return `${prefix}${message.content}`;
    } else if (message.message_type === 'gif') {
      return `${prefix}GIF`;
    }
    return `${prefix}${message.content}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="mb-2">💬</div>
        <p className="text-sm">No conversations yet.</p>
        <p className="text-xs opacity-60 mt-1">Search for users to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 hover:bg-gray-900/50 cursor-pointer transition-all duration-200 ${
            selectedConversationId === conversation.id 
              ? 'bg-gray-800 border-l-2 border-blue-500' 
              : ''
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-gray-700">
              <AvatarImage src={conversation.other_user.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-700 text-white font-medium">
                {(conversation.other_user.display_name || conversation.other_user.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {conversation.other_user.display_name || conversation.other_user.email.split('@')[0]}
                </p>
                {conversation.last_message && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate">
                {renderLastMessage(conversation.last_message)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
