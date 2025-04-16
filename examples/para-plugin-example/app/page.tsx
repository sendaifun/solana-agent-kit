'use client';

import { ChatWindow } from "../components/ChatWindow";
import { AuthLayout, ParaModal } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { para} from "@/utils/para";
import { useEffect, useState } from "react";



export default function ChatbotPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
   const [email, setEmail] = useState("");

 

  const handleCheckIfAuthenticated = async () => {
    if (!para) return;
    setError("");
    setIsLoading(true);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      const user = await para.getEmail();
      setEmail(user as string);
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!para) return;
    const initialize = async () => {
        handleCheckIfAuthenticated();
    };
    initialize();
  }, [para]);

  const handleCloseModal = () => {
    handleCheckIfAuthenticated();
    setIsOpen(false);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleLogout = async () => {
    if (!para) return;
    await para.logout();
    setIsConnected(false);
  };

  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
    
      <h1 className="text-3xl md:text-4xl mb-4">
        Para Agent Chatbot 🤖
      </h1>

      <ul>
        <li className="text-l">
          🔧
          <span className="ml-2">
            This chatbot can interact with Para sdk using various tools.
          </span>
        </li>
        <li className="text-l">
          💡
          <span className="ml-2">
            Try asking e.g. <code>create pregen wallet with this email  dev@test.getpara.com</code> or <code>claim pregen wallet with email dev@test.getpara.com</code>
          </span>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-4">
      <span className="flex items-center justify-center mr-4">{email}</span>
        {!isConnected && <button onClick={handleOpenModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Login
        </button>}
        {isConnected && <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Logout
        </button>}
        <ParaModal
          para={para}
          isOpen={isOpen}
          onClose={handleCloseModal}
          disableEmailLogin={false}
          disablePhoneLogin={true}
          authLayout={[AuthLayout.AUTH_FULL]}
          oAuthMethods={[]}
          onRampTestMode={true}
          theme={{
            foregroundColor: "#2D3648",
            backgroundColor: "#FFFFFF",
            accentColor: "#0066CC",
            darkForegroundColor: "#E8EBF2",
            darkBackgroundColor: "#1A1F2B",
            darkAccentColor: "#4D9FFF",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          }}
          appName="Para Pregen Claim"
          recoverySecretStepEnabled={true}
          twoFactorAuthEnabled={false}
        />
      </div>
      <ChatWindow
        endpoint="/api/chat"
        emoji="🤖"
        titleText="Solana Agent Chatbot"
        placeholder="Ask me anything about Solana..."
        emptyStateComponent={InfoCard}
      para={para}
      />
    </div>
  );
} 