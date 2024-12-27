'use client';

import { Bot, User } from 'lucide-react';
import { Message } from '../../types/chat';
import MessageContent from './MessageContent';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div className={cn(
      'py-4 px-4 sm:px-6',
    )}>
      <div className={cn("p-2 max-w-3xl mx-auto flex gap-4 animate-in slide-in-from-bottom duration-300", !isAI && "bg-muted")}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isAI ? 'bg-primary/10' : 'bg-secondary'
        )}>
          {isAI ? <Bot size={20} /> : <User size={20} />}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {isAI ? 'AI Assistant' : 'You'}
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MessageContent content={message.content} />
          </div>
        </div>
      </div>
    </div>
  );
}