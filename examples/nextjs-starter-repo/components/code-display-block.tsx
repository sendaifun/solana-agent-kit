"use client";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import React from "react";
import { CodeBlock, dracula, github } from "react-code-blocks";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface ButtonCodeblockProps {
  code: string;
}

export default function CodeDisplayBlock({ code }: ButtonCodeblockProps) {
  const [isCopied, setisCopied] = React.useState(false);
  const { theme } = useTheme();

  const filteredCode = code.split("\n").slice(1).join("\n") || code;
  const language = code.split("\n")[0] || "tsx";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(filteredCode);
    setisCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => {
      setisCopied(false);
    }, 1500);
  };

  return (
    <div className="relative my-4 overflow-scroll overflow-x-scroll  flex flex-col   text-start  ">
      <Button
        onClick={copyToClipboard}
        variant="ghost"
        size="icon"
        className="h-5 w-5 absolute top-2 right-2"
      >
        {isCopied ? (
          <CheckIcon className="w-4 h-4 scale-100 transition-all" />
        ) : (
          <CopyIcon className="w-4 h-4 scale-100 transition-all" />
        )}
      </Button>
      <CodeBlock
        customStyle={
          theme === "dark"
            ? { background: "#303033" }
            : { background: "#fcfcfc" }
        }
        text={code}
        language={language}
        showLineNumbers={false}
        theme={theme === "dark" ? dracula : github}
      />
    </div>
  );
}
