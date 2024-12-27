"use client";

import { HumanMessage } from "@langchain/core/messages";
import { useChat, Message } from "ai/react";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatLayout } from "../../components/chat/chat-layout";
import { Agent, Config } from "../page";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { useParams } from "next/navigation";

export default function Page() {
  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    error,
    stop,
    setMessages,
    setInput,
  } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: () => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });
  const [chatId, setChatId] = useState<string>("");
  const [agent, setAgent] = useState<Agent>()
  const [config, setConfig] = useState<Config>()
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const {id} = useParams()

  React.useEffect(() => {
    if (chatId) {
      const item = localStorage.getItem(`chat_${chatId}`);
      if (item) {
        setMessages(JSON.parse(item));
      }
    }
  }, [chatId]);

  useEffect(() => {
    initializeAgent();
    if (typeof id == 'string'){
      setChatId(id)
    }
  },[])

  const initializeAgent = () => {
    try {
      if (!process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY
        || !process.env.NEXT_PUBLIC_RPC_URL
        || !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return
      }
      const llm = new ChatOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
        modelName: "gpt-4o-mini",
        temperature: 0.7,
      });

      const solanaAgent = new SolanaAgentKit(
        process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY!,
        process.env.NEXT_PUBLIC_RPC_URL,
        process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      );

      const tools = createSolanaTools(solanaAgent);
      const config = { configurable: { thread_id: "Solana Agent Kit!" } };

      const agent = createReactAgent({
        llm,
        tools,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
          can't do with your currently available tools, you must say so, and encourage them to implement it
          themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
          concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        `,
      });
      setAgent(agent)
      setConfig(config)
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error;
    }
  }

  const addMessage = (Message: Message) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  // Function to handle chatting with Ollama in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    addMessage({ role: "user", content: input, id: chatId });
    setInput("");
    if (agent) {
      const stream = await agent.stream(
        { messages: [new HumanMessage(input)] },
        config,
      );
      let text = ""
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          text += chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
          text += chunk.tools.messages[0].content;
        }
      }
      addMessage({ role: "assistant", content: text, id: chatId });
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
    }

  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);

    setMessages([...messages]);
    handleSubmitProduction(e);
  };

  // When starting a new chat, append the messages to the local storage
  React.useEffect(() => {
    if (!isLoading && !error && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [messages, chatId, isLoading, error]);

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center">
       <ChatLayout
        messages={messages}
        input={input}
        chatId={chatId}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        loadingSubmit={loadingSubmit}
        error={error}
        stop={stop}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
        formRef={formRef}
        setMessages={setMessages}
        setInput={setInput}
      />
    </main>
  );
}
