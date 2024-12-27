'use client';

import { MessageSquarePlus, MessagesSquare } from 'lucide-react';
import { Chat } from '../../types/chat';
import { cn } from '../../lib/utils';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ chats, currentChatId, onChatSelect, onNewChat }: ChatSidebarProps) {
  return (
    <div className="w-80 h-screen bg-muted/30 border-r flex flex-col">
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 m-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
      >
        <MessageSquarePlus size={20} />
        <span>New Chat</span>
      </button>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={cn(
              "w-full flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left",
              currentChatId === chat.id && "bg-muted"
            )}
          >
            <MessagesSquare size={20} />
            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}