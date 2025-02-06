"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AIResponse from "@/lib/ai-response";
import { Message } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AIChat() {
  const messageRef = useRef<HTMLDivElement>(null);
  const { publicKey, sendTransaction } = useWallet();
  // Todo: we can store this to local storage (not db because it will be too much for an example)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI crypto assistant. How can I help you today?",
      role: "system",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "Give last 5 transactions",
    "How much SOL do I have?",
    "What is my Public Address?",
    "Create Token Named GOKU and assume other details",
  ];

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    if (!publicKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 1,
          content: "Please connect your wallet to send a message",
          role: "system",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = {
      id: messages.length + 1,
      content,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);
    let chatHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    chatHistory.push({
      content,
      role: "user",
    });
    const AIResponseText = await AIResponse(
      chatHistory,
      publicKey,
      sendTransaction,
    );
    const aiMessage: Message = {
      id: messages.length + 2,
      content: AIResponseText?.message as string,
      role: "system",
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  return (
    <Card className="flex flex-col h-screen backdrop-blur-xl bg-black/40 border-purple-500/20">
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <AnimatePresence>
          {messages.map((message) => (
            <div ref={messageRef} key={message.id}>
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-start gap-3 break-words ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.role === "user"
                      ? "bg-purple-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-purple-500/20 text-purple-50"
                      : "bg-blue-500/20 text-blue-50"
                  }`}
                >
                  <Markdown
                    rehypePlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-300 underline hover:text-blue-400"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </Markdown>
                </motion.div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <Bot className="w-4 h-4" />
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-2 overflow-x-auto pb-2 text-white">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              onClick={() => handleSend(suggestion)}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask anything about your wallet..."
            className="backdrop-blur-xl bg-white/5 text-white border-purple-500/20 focus:border-purple-500/50 transition-colors"
          />
          <Button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="bg-purple-500 hover:bg-purple-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
