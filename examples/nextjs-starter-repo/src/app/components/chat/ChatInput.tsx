'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="max-w-3xl mx-auto p-4">
        <div className="relative flex items-end gap-2 bg-muted/50 rounded-lg border p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}
            placeholder="Message..."
            rows={1}
            disabled={disabled || isLoading}
            className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none p-2 max-h-48 overflow-y-auto"
          />
          
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </div>
        
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Solana can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}