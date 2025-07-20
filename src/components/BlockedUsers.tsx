
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserX, UserCheck } from "lucide-react";

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  blocked_user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface BlockedUsersProps {
  currentUserId: string;
  onClose: () => void;
}

export const BlockedUsers = ({ currentUserId, onClose }: BlockedUsersProps) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlockedUsers();
  }, [currentUserId]);

  const fetchBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          *,
          blocked_user:profiles!blocked_users_blocked_id_fkey(display_name, email, avatar_url)
        `)
        .eq('blocker_id', currentUserId);

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setBlockedUsers(prev => prev.filter(b => b.id !== blockId));
      toast({
        title: "User unblocked",
        description: `${userName} has been unblocked.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md max-h-96">
        <h2 className="text-xl font-bold text-white mb-6">Blocked Users</h2>
        
        <div className="space-y-3 overflow-y-auto max-h-64">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center text-gray-400">No blocked users</div>
          ) : (
            blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={blockedUser.blocked_user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {(blockedUser.blocked_user.display_name || blockedUser.blocked_user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {blockedUser.blocked_user.display_name || blockedUser.blocked_user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-400">{blockedUser.blocked_user.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unblockUser(
                    blockedUser.id, 
                    blockedUser.blocked_user.display_name || blockedUser.blocked_user.email
                  )}
                  className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full mt-4"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
