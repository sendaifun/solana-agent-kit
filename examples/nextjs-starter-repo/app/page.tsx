"use client"
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatLayout } from "../components/chat/chat-layout";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { CompiledStateGraph, MessagesAnnotation, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";

export type Agent = CompiledStateGraph<(typeof MessagesAnnotation)["State"], (typeof MessagesAnnotation)["Update"], typeof START | "agent" | "tools", typeof MessagesAnnotation.spec, typeof MessagesAnnotation.spec>;
export type Config = {
  configurable: {
    thread_id: string;
  };
}

export default function Home() {
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
    onResponse: (response: Response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: () => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [agent, setAgent] = useState<Agent>()
  const [chatId, setChatId] = React.useState<string>("");
  const [config, setConfig] = useState<Config>()
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    initializeAgent();
  },[])

  useEffect(() => {
    if (messages.length < 1) {
      // Generate a random id for the chat
      console.log("Generating chat id");
      const id = uuidv4();
      setChatId(id);
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      // Save messages to local storage
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [chatId, isLoading, error]);

  const addMessage = (Message: Message) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

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

  // Function to handle chatting with cr8AI in production (client side)
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
    setLoadingSubmit(false);

    setMessages([...messages]);

    handleSubmitProduction(e);
  };

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
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
