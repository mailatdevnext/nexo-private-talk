
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        {/* No actions available */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
