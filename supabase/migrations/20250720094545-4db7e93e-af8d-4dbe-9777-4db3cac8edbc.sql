
-- Add profile customization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN bio text;
ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline'));
ALTER TABLE public.profiles ADD COLUMN last_seen timestamp with time zone DEFAULT now();

-- Create blocked_users table for permanent user blocking
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users table
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies for blocked_users
CREATE POLICY "Users can view their blocked users" 
  ON public.blocked_users 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block other users" 
  ON public.blocked_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock users" 
  ON public.blocked_users 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('message', 'conversation')),
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  related_id uuid, -- conversation_id or message_id
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add soft delete to conversations (instead of permanent delete initially)
ALTER TABLE public.conversations ADD COLUMN deleted_by_participant1 boolean DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN deleted_by_participant2 boolean DEFAULT false;

-- Update conversations to track last interaction
ALTER TABLE public.conversations ADD COLUMN last_interaction_at timestamp with time zone DEFAULT now();

-- Create function to update last seen timestamp
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now() 
  WHERE id = auth.uid();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last seen on message insert
CREATE TRIGGER update_user_last_seen
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_seen();
