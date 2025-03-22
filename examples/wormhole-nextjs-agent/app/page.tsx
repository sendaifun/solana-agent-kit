"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "../components/ChatInput";
import { Header } from "../components/Header";
import { MessageBubble } from "../components/MessageBubble";
import { LogsPanel } from "../components/LogsPanel";


// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}


// Constants
const INITIAL_GREETING = "Welcome to the Wormhole Agent! I'm here to help you with cross-chain operations. How can I assist you today?";

// Helper Components




// Utility functions
const formatToolCall = (toolCallJson: string): string => {
  // Return the raw JSON string for the MessageBubble component to handle
  return toolCallJson;
};

const parseSSEMessage = (line: string) => {
  if (!line.startsWith("data: ")) return null;
  
  try {
    return JSON.parse(line.substring(6)); // Remove "data: " prefix
  } catch (e) {
    console.error("Error parsing SSE message:", e);
    return null;
  }
};

// Main component
export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: INITIAL_GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Agent initialized and ready to assist with Wormhole operations.",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleToolCall = (toolCallData: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
    addLog(`Tool call detected: ${toolCallData.substring(0, 100)}${toolCallData.length > 100 ? '...' : ''}`);
    
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.content.includes("Processing")) {
        return newMessages;
      } else {
        return [...newMessages, { role: "assistant", content: formatToolCall(toolCallData) }];
      }
    });
  };

  const handleContentChunk = (chunk: string, assistantMessage: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>, userQuestion: string) => {
    // Clean the chunk to remove any instances of the user's question
    if (chunk.startsWith(userQuestion)) {
      chunk = chunk.substring(userQuestion.length).trim();
    }
    
    // Check for patterns like "what is wormhole?Wormhole is a protocol..."
    const questionPattern = new RegExp(`^${userQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
    chunk = chunk.replace(questionPattern, '');
    
    const updatedMessage = assistantMessage + chunk;
    
    // Don't show "Processing..." messages in the final output
    if (updatedMessage.trim() === "Processing..." || updatedMessage.trim() === "Processing request...") {
      return assistantMessage;
    }
    
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.content.startsWith('[{') && !lastMessage.content.startsWith('{')) {
        lastMessage.content = updatedMessage;
        return [...newMessages];
      } else {
        return [...newMessages, { role: "assistant", content: updatedMessage }];
      }
    });
    
    return updatedMessage;
  };

  const processSSEChunk = (
    jsonData: { chunk?: string }, 
    isToolCall: boolean, 
    toolCallData: string, 
    assistantMessage: string,
    userQuestion: string
  ) => {
    let updatedToolCall = isToolCall;
    let updatedToolCallData = toolCallData;
    let updatedAssistantMessage = assistantMessage;
    
    if (!jsonData.chunk) return { isToolCall: updatedToolCall, toolCallData: updatedToolCallData, assistantMessage: updatedAssistantMessage };
    
    // Log the raw chunk for debugging
    addLog(`Received chunk: ${jsonData.chunk.substring(0, 50)}${jsonData.chunk.length > 50 ? '...' : ''}`);
    
    // Check if this is a tool call
    if (jsonData.chunk.startsWith('[{') && jsonData.chunk.includes('"type":"tool_call"')) {
      updatedToolCall = true;
      updatedToolCallData = jsonData.chunk;
      handleToolCall(jsonData.chunk, setMessages);
      return { isToolCall: updatedToolCall, toolCallData: updatedToolCallData, assistantMessage: updatedAssistantMessage };
    } 
    // Check if this is a tool response (JSON data)
    else if ((jsonData.chunk.startsWith('{') || jsonData.chunk.startsWith('[')) && isToolCall) {
      try {
        // Store the JSON response to be displayed by the MessageBubble component
        const toolResponse = jsonData.chunk;
        
        // Add the tool response to messages
        setMessages((prev) => {
          const newMessages = [...prev];
          return [...newMessages, { role: "assistant", content: toolResponse }];
        });
        
        addLog(`Tool response received: ${toolResponse.substring(0, 100)}${toolResponse.length > 100 ? '...' : ''}`);
        
        // Reset state for subsequent text content
        return { isToolCall: false, toolCallData: "", assistantMessage: "" };
      } catch (e) {
        addLog(`Error processing tool response: ${e}`);
      }
    }
    
    // This is regular content
    if (isToolCall) {
      updatedToolCall = false;
      updatedAssistantMessage = ""; // Reset the message to start fresh
    }
    
    updatedAssistantMessage = handleContentChunk(jsonData.chunk, updatedAssistantMessage, setMessages, userQuestion);
    
    return { 
      isToolCall: updatedToolCall, 
      toolCallData: updatedToolCallData, 
      assistantMessage: updatedAssistantMessage 
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    addLog(`User: ${input}`);
    addLog("Sending request to agent...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      const decoder = new TextDecoder();
      let buffer = "";
      let isToolCall = false;
      let toolCallData = "";
      const userQuestion = input; // Store the user's question for reference

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          
          if (line.includes("data: [DONE]")) {
            addLog("Response completed");
            continue;
          }

          const jsonData = parseSSEMessage(line);
          if (jsonData) {
            const result = processSSEChunk(jsonData, isToolCall, toolCallData, assistantMessage, userQuestion);
            isToolCall = result.isToolCall;
            toolCallData = result.toolCallData;
            assistantMessage = result.assistantMessage;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput 
            input={input} 
            setInput={setInput} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>

        <LogsPanel logs={logs} />
      </div>
    </div>
  );
}
