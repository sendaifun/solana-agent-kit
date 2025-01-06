"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import ExpandingTextArea from "./_comp/expanding-text-area";
import ChatBubble from "./_comp/chat-bubble";

interface Message {
  content: string;
  role: "user" | "assistant";
}

export default function Page() {
  const [userInput, setUserInput] = useState<string>("");
  const [chats, setChats] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [loading, chats]);

  const addToChat = (text: string, role: "user" | "assistant") => {
    const newMessage: Message = { content: text, role };
    setChats((prevChats) => [...prevChats, newMessage]);
  };

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    addToChat(userInput, "user");
    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      setUserInput("");

      const data = await response.json();

      console.log(data);

      if (data.success) {
        addToChat(data.messages, "assistant");
      } else {
        addToChat(`Error: ${data.error}`, "assistant");
      }
    } catch (error) {
      addToChat(
        "Failed to process your request. Please try again.",
        "assistant"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (text: string): void => {
    handleClick();
  };

  return (
    <div className="h-screen w-full p-4 flex flex-col relative justify-center items-center pb-24">
      <div
        className="w-full h-full border border-indigo-200 rounded-md p-2 flex-col flex gap-2 overflow-y-auto space-y-4"
        ref={chatRef}
      >
        {chats.length !== 0 ? (
          chats.map((chats, key) => (
            <ChatBubble key={key} text={chats.content} role={chats.role} />
          ))
        ) : (
          <div className="h-full w-full text-center flex flex-col gap-4 place-items-center justify-center">
            <h1 className="text-3xl font-bold">What would you like to do?</h1>
            <p>Type something to start the chat</p>
          </div>
        )}
        {loading && (
          <div className="border border-indigo-300 w-[85%] md:w-[50%] rounded-md p-3 bg-indigo-100 rounded-bl-none">
            {/* Skeleton for the header (role) */}
            <div className="h-4 bg-gray-300 animate-pulse w-1/4 mb-2"></div>

            {/* Skeleton for the text */}
            <div className="h-6 bg-gray-300 animate-pulse rounded-md w-full mb-2"></div>
            <div className="h-6 bg-gray-300 animate-pulse rounded-md w-full mb-2"></div>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 left-4 right-4 flex border-2 border-indigo-200 rounded-md">
        {/* <input type="text" name="input" autoFocus className="flex-1 outline-none border-none text-black"/> */}
        <ExpandingTextArea
          disabled={loading}
          text={userInput}
          setText={setUserInput}
          placeholder="Enter your message..."
          onEnter={handleEnter}
        />
        <button
          className="p-4 bg-indigo-600 text-white rounded-md"
          onClick={handleClick}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
