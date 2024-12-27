"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";

interface ChatTopbarProps {
  isLoading: boolean;
  messages: Message[];
  chatId:string;
  setMessages: (messages: Message[]) => void;
}

export default function ChatTopbar({
  messages,
  setMessages,
  chatId
}: ChatTopbarProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleCloseSidebar = () => {
    setSheetOpen(false);  // Close the sidebar
  };

  return (
      <div className="w-full flex px-4 py-6  items-center justify-between lg:justify-center ">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger>
            <HamburgerMenuIcon className="lg:hidden w-5 h-5"/>
          </SheetTrigger>
          <SheetContent side="left">
            <Sidebar
                chatId={chatId}
                isCollapsed={false}
                isMobile={false}
                messages={messages}
                setMessages={setMessages}
                closeSidebar={handleCloseSidebar}
            />
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center space-x-4">
          {/* Add your image here */}
          <img
              src="/logo.png"
              alt="Top Right Image"
              className="w-35 h-10 object-cover rounded"
          />
        </div>
      </div>

  );
}
