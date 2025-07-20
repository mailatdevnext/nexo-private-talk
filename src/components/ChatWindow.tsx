import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "./MediaPicker";
import { ChatActions } from "./ChatActions";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: 'text' | 'sticker' | 'gif';
  sender: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  onConversationDeleted?: () => void;
}

export const ChatWindow = ({ conversationId, currentUserId, onConversationDeleted }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchConversationDetails();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages(); // Refetch to get sender details
          
          // Create notification for the other user
          if (payload.new.sender_id !== currentUserId) {
            createNotification(payload.new.sender_id, payload.new.content);
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNotification = async (senderId: string, messageContent: string) => {
    try {
      // Get sender's display name
      const { data: senderData } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', senderId)
        .single();

      const senderName = senderData?.display_name || senderData?.email?.split('@')[0] || 'Someone';

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: currentUserId,
          type: 'message',
          title: `New message from ${senderName}`,
          message: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
          related_id: conversationId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const fetchConversationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(*),
          participant2:profiles!conversations_participant2_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const otherUser = data.participant1_id === currentUserId 
        ? data.participant2 
        : data.participant1;
      
      setOtherUser(otherUser);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(display_name, email, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type cast the message_type to ensure it matches our union type
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type || 'text') as 'text' | 'sticker' | 'gif'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'sticker' | 'gif' = 'text') => {
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (messageType === 'text') {
        setNewMessage("");
      }
      setShowMediaPicker(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage, 'text');
  };

  const handleStickerSelect = (sticker: string) => {
    sendMessage(sticker, 'sticker');
  };

  const handleGifSelect = (gif: string) => {
    sendMessage(gif, 'gif');
  };

  const renderMessage = (message: Message) => {
    if (message.message_type === 'sticker') {
      return <span className="text-4xl">{message.content}</span>;
    } else if (message.message_type === 'gif') {
      return (
        <img 
          src={message.content} 
          alt="GIF" 
          className="max-w-48 rounded-lg shadow-lg"
        />
      );
    }
    return <p className="text-sm leading-relaxed">{message.content}</p>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div className="text-gray-400 text-sm">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-black">
      {/* Chat Header */}
      {otherUser && (
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-gray-700">
                <AvatarImage src={otherUser.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {(otherUser.display_name || otherUser.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-white">{otherUser.display_name || otherUser.email.split('@')[0]}</h3>
                <p className="text-sm text-gray-400">{otherUser.email}</p>
                {otherUser.last_seen && (
                  <p className="text-xs text-gray-500">
                    Last seen {formatDistanceToNow(new Date(otherUser.last_seen), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            <ChatActions 
              conversationId={conversationId}
              otherUserId={otherUser.id}
              otherUserName={otherUser.display_name || otherUser.email.split('@')[0]}
              currentUserId={currentUserId}
              onConversationDeleted={() => onConversationDeleted?.()}
              onUserBlocked={() => onConversationDeleted?.()}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && (
                  <Avatar className="h-6 w-6 ring-1 ring-gray-700">
                    <AvatarImage src={message.sender.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-gray-700 text-white">
                      {(message.sender.display_name || message.sender.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-2xl px-4 py-2 shadow-lg ${
                  isOwnMessage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  {renderMessage(message)}
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Picker */}
      {showMediaPicker && (
        <MediaPicker
          onStickerSelect={handleStickerSelect}
          onGifSelect={handleGifSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Message Input */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <form onSubmit={handleTextMessage} className="flex space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 rounded-xl"
            disabled={sending}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
