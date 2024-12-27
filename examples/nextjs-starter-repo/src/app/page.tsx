"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Settings as SettingsIcon } from "lucide-react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import SettingsPanel from "../components/settings/SettingsPanel";
import { Chat, Message } from "../types/chat";
import { Settings } from "../types/settings";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [typing, setTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    openAi: "",
    solPrivateKey: "",
    solRpcUrl: "https://api.devnet.solana.com",
  });

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  useEffect(() => {
    const storedChats = localStorage.getItem("chat");
    const storedSettings = localStorage.getItem("settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    }
  }, []);

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    const chatDetails = [newChat, ...chats];
    setChats(chatDetails);
    setCurrentChatId(newChat.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId || !settings.openAi || !settings.solPrivateKey) return;
    setTyping(true);

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      createdAt: new Date(),
    };

    const chatDetails = chats.map((chat) => {
      if (chat.id === currentChatId) {
        const title =
          chat.messages.length === 0 ? content.slice(0, 30) : chat.title;
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          title: title,
        };
      }
      return chat;
    });

    setChats(chatDetails);
    localStorage.setItem("chat", JSON.stringify(chatDetails));

    const response = await fetch(`/api/chat/${currentChatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Key": settings.openAi,
        "Solana-Private-Key": settings.solPrivateKey,
        "Solana-Rpc-Url": settings.solRpcUrl,
      },
      body: JSON.stringify({
        message: content,
      }),
    });

    if (!response.ok) {
      setTyping(false);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const aiMessage: Message = {
      id: uuidv4(),
      content: result.message,
      role: "assistant",
      createdAt: new Date(),
    };

    setTyping(false);
    const chatDetailsNew = chats.map((chat) => {
      if (chat.id === currentChatId) {
        const title =
          chat.messages.length === 0 ? content.slice(0, 30) : chat.title;
        return {
          ...chat,
          messages: [...chat.messages, userMessage, aiMessage],
          title: title,
        };
      }
      return chat;
    });

    setChats(chatDetailsNew);
    localStorage.setItem("chat", JSON.stringify(chatDetailsNew));
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
          {!isSettingsOpen && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Open settings"
            >
              <SettingsIcon size={20} />
            </button>
          )}
        </div>

        {currentChat ? (
          <>
            <div className="flex-1 overflow-auto">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {typing && (
                <div className="max-w-3xl mx-auto rounded-lg shadow-md py-4 px-4 sm:px-6">
                  <p className="text-gray-700 text-lg mb-4">Bot is typing...</p>
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>
            <ChatInput onSend={handleSendMessage} disabled={!settings.openAi} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold">Welcome to Solana AI</div>
              <div className="text-muted-foreground">
                {settings.openAi
                  ? "Start a new chat or select an existing one."
                  : "Please configure your OpenAI API key in settings."}
              </div>
              <button
                onClick={createNewChat}
                disabled={!settings.openAi}
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
            localStorage.setItem("settings", JSON.stringify(newSettings));
            setIsSettingsOpen(false);
          }}
        />
      </div>
    </div>
  );
}
