"use client";

import React, { useEffect } from "react";
import { ChatProps } from "./chat";
import { AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { Cross2Icon, StopIcon } from "@radix-ui/react-icons";
import { Mic, SendHorizonal } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import MultiImagePicker from "../image-embedder";
import useChatStore from "../../app/hooks/useChatStore";

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
}: ChatProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const env = process.env.NODE_ENV;

  React.useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);


  return (
    <div className="p-4 pb-7 flex justify-between w-full items-center gap-2">
      <AnimatePresence initial={false}>
        <div className="w-full items-center flex relative gap-2">
          <div className="flex flex-col relative w-full bg-accent dark:bg-card rounded-lg">
            <div className="flex w-full">
              <form
                onSubmit={handleSubmit}
                className="w-full items-center flex relative gap-2"
              >
                <div className="absolute flex left-3 z-10">
                  <MultiImagePicker disabled={env === 'production'} onImagesPick={setBase64Images} />
                </div>
                <TextareaAutosize
                  autoComplete="off"
                  value={input}
                  ref={inputRef}
                  onKeyDown={handleKeyPress}
                  onChange={handleInputChange}
                  name="message"
                  placeholder={"Enter your prompt here"}
                  className=" max-h-24 px-14 bg-accent py-[22px] rounded-lg  text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full flex items-center h-16 resize-none overflow-hidden dark:bg-card"
                />
                <div className="flex absolute right-3 items-center">
                <Button
                      className="shrink-0 rounded-full"
                      variant="ghost"
                      size="icon"
                      type="submit"
                    >
                      <SendHorizonal className="w-5 h-5 " />
                    </Button>
                
                </div>
              </form>
            </div>
            {base64Images && (
              <div className="flex px-2 pb-2 gap-2 ">
                {base64Images.map((image, index) => {
                  return (
                    <div key={index} className="relative bg-muted-foreground/20 flex w-fit flex-col gap-2 p-1 border-t border-x rounded-md">
                      <div className="flex text-sm">
                        <Image src={image} width={20}
                          height={20}
                          className="h-auto rounded-md w-auto max-w-[100px] max-h-[100px]" alt={""} />
                      </div>
                      <Button
                        onClick={() => {
                          const updatedImages = (prevImages: string[]) => prevImages.filter((_, i) => i !== index);
                          setBase64Images(updatedImages(base64Images));
                        }}
                        size='icon' className="absolute -top-1.5 -right-1.5 text-white cursor-pointer  bg-red-500 hover:bg-red-600 w-4 h-4 rounded-full flex items-center justify-center">
                        <Cross2Icon className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
