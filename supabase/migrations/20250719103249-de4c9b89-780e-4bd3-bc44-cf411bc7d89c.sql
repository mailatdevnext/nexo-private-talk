
-- Add message_type column to messages table to support stickers and GIFs
ALTER TABLE public.messages ADD COLUMN message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'sticker', 'gif'));
