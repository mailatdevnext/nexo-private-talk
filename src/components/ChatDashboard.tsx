
import React, { useState } from 'react';
import { NexoLogo } from './NexoLogo';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { ConversationsList } from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import { ProfileSettings } from './ProfileSettings';
import { NotificationCenter } from './NotificationCenter';

interface ChatDashboardProps {
  user: User | null;
}

export const ChatDashboard: React.FC<ChatDashboardProps> = ({ user }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleConversationDeleted = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <NexoLogo size="md" />
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-white"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowProfile(!showProfile)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User Search */}
          <UserSearch 
            currentUserId={user?.id || ''}
            onConversationCreated={handleConversationCreated}
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <ConversationsList
            currentUserId={user?.id || ''}
            selectedConversationId={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </div>

        {/* Footer with About link */}
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('/about', '_blank')}
            className="w-full text-gray-400 hover:text-white text-sm"
          >
            About NEXO
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow 
            conversationId={selectedConversation}
            currentUserId={user?.id || ''}
            onConversationDeleted={handleConversationDeleted}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black text-gray-400">
            <div className="text-center">
              <div className="mb-6">
                <NexoLogo size="lg" className="justify-center" />
              </div>
              <p className="text-lg mb-2">Welcome to NEXO</p>
              <p className="text-sm opacity-60">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Settings Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <ProfileSettings user={user} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <NotificationCenter 
              currentUserId={user?.id || ''}
              onClose={() => setShowNotifications(false)}
              onConversationSelect={setSelectedConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
};
