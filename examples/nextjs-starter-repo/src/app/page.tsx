"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState("");

  const fetchBotReply = async (message: string) => {
    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply;
      } else {
        console.error("Failed to fetch bot reply");
        return "Sorry, something went wrong.";
      }
    } catch (error) {
      console.error("Error fetching bot reply:", error);
      return "Sorry, something went wrong.";
    }
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, isUser: true },
      ]);
      setInput("");

      const botReply = await fetchBotReply(userMessage);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, isUser: false },
      ]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-2xl">
        <div className="flex items-center gap-4">
          <span className="text-xl">Simple Chat Bot with</span>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={80}
            height={80}
            priority
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2 p-4 border rounded-lg h-96 overflow-y-auto bg-white dark:bg-gray-800">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white self-start"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
            />
            <button
              className="p-2 bg-blue-500 text-white rounded-lg"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
