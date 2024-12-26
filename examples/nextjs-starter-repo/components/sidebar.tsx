"use client";

import { SquarePen } from "lucide-react";
import { Message } from "ai/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  setMessages: (messages: Message[]) => void;
  closeSidebar?: () => void;
}

export function Sidebar({
  isCollapsed,
  isMobile,
  setMessages,
  closeSidebar
}: SidebarProps) {
  const router = useRouter();


  return (
    <div
      data-collapsed={isCollapsed}
      className="relative justify-between group lg:bg-accent/20 lg:dark:bg-card/35 flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      <div className=" flex flex-col justify-between p-2 max-h-fit overflow-y-auto">
        <Button
          onClick={() => {
            router.push("/");
            // Clear messages
            setMessages([]);
            if (closeSidebar) {
              closeSidebar();
            }
          }}
          variant="ghost"
          className="flex justify-between w-full h-14 text-sm xl:text-lg font-normal items-center "
        >
          <div className="flex gap-3 items-center ">
            {!isCollapsed && !isMobile && (
              <Image
                src="/solanaLogo.png"
                alt="AI"
                width={28}
                height={28}
              />
            )}
            New chat
          </div>
          <SquarePen size={18} className="shrink-0 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
