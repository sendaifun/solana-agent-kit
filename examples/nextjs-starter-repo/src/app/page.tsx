'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Settings as SettingsIcon } from 'lucide-react';
import ChatSidebar from './components/chat/ChatSidebar';
import ChatMessage from './components/chat/ChatMessage';
import ChatInput from './components/chat/ChatInput';
import SettingsPanel from './components/settings/SettingsPanel';
import { Chat, Message } from './types/chat';
import { useSettings } from './hooks/useSettings';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, setSettings } = useSettings();

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId || !settings.openAiKey) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      createdAt: new Date(),
    };

    setChats(chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          title: chat.messages.length === 0 ? content.slice(0, 30) : chat.title,
        };
      }
      return chat;
    }));

    // TODO: Implement OpenAI API call
    const aiMessage: Message = {
      id: uuidv4(),
      content: 'This is a simulated AI response. Replace with actual OpenAI integration.',
      role: 'assistant',
      createdAt: new Date(),
    };

    setChats(chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage, aiMessage],
        };
      }
      return chat;
    }));
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
      />
      
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
          {!isSettingsOpen && <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Open settings"
          >
            <SettingsIcon size={20} />
          </button> }
        </div>

        {currentChat ? (
          <>
            <div className="flex-1 overflow-auto">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={!settings.openAiKey}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Welcome to Solana AI</h1>
              <p className="text-muted-foreground">
                {settings.openAiKey 
                  ? 'Start a new chat or select an existing one.'
                  : 'Please configure your OpenAI API key in settings.'}
              </p>
              <button
                onClick={createNewChat}
                disabled={!settings.openAiKey}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setIsSettingsOpen(false);
          }}
        />
      </div>
    </div>
  );
}