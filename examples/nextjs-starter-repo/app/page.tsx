"use client"
import { Attachment } from "ai";
import { Message, useChat } from "ai/react";
import useChatStore from "./hooks/useChatStore";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatLayout } from "../components/chat/chat-layout";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { CompiledStateGraph, MemorySaver, MessagesAnnotation, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import config from "next/config";

type Agent = CompiledStateGraph<(typeof MessagesAnnotation)["State"], (typeof MessagesAnnotation)["Update"], typeof START | "agent" | "tools", typeof MessagesAnnotation.spec, typeof MessagesAnnotation.spec>;
type Config = {
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
    onResponse: (response: any) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: (error: any) => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [agent,setAgent] = useState<Agent>()
  const [config,setConfig] = useState<Config>()
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state: { base64Images: any; }) => state.base64Images);
  const setBase64Images = useChatStore((state: { setBase64Images: any; }) => state.setBase64Images);

  useEffect(()=>{
    initializeAgent();
  })

  const addMessage = (Message: Message) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  const initializeAgent = () => {
    try {
      const llm = new ChatOpenAI({
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

    addMessage({ role: "user", content: input, id: "" });
    setInput("");
    if(agent){
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
      addMessage({ role: "assistant", content: text, id: "" });
    }
       
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(false);

    setMessages([...messages]);

    handleSubmitProduction(e);
    setBase64Images(null)
  };

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
        <ChatLayout
          messages={messages}
          input={input}
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
