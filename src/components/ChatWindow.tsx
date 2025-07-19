import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Smile, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "./MediaPicker";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type?: 'text' | 'sticker' | 'gif';
  sender: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export const ChatWindow = ({ conversationId, currentUserId }: ChatWindowProps) => {
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
      setMessages(data || []);
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
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (messageType === 'text') {
        setNewMessage("");
      }
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
          className="max-w-48 rounded-lg"
        />
      );
    }
    return <p className="text-sm">{message.content}</p>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Chat Header */}
      {otherUser && (
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback>
                {(otherUser.display_name || otherUser.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{otherUser.display_name || otherUser.email.split('@')[0]}</h3>
              <p className="text-sm text-muted-foreground">{otherUser.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {(message.sender.display_name || message.sender.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-3 py-2 ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {renderMessage(message)}
                  <p className={`text-xs mt-1 opacity-70`}>
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
      <div className="bg-card border-t border-border p-4">
        <form onSubmit={handleTextMessage} className="flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaPicker(!showMediaPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
