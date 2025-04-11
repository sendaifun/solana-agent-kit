import { motion } from "motion/react";
import { Button } from "./ui/button";
import { memo } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useNavigate } from "@tanstack/react-router";

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers["append"];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const nav = useNavigate();
  const suggestedActions = [
    {
      title: "What is my",
      label: "wallet balance",
      action: "What is my wallet balance?",
    },
    {
      title: "What's the price",
      label: "of SOL",
      action: "What's the price of SOL?",
    },
    {
      title: "Swap 0.1 SOL for",
      label: "EPjFWdd5AufqSSqeM2qKkMvzY2k8k4k8B1t1aQ7x1Z1",
      action: "Swap 0.1 SOL for EPjFWdd5AufqSSqeM2qKkMvzY2k8k4k8B1t1aQ7x1Z1",
    },
    {
      title: "Is this a rug pull",
      label: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
      action: "Is this a rug pull 6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              nav({
                href: `/chats/${chatId}?input=${suggestedAction.action}`,
                replace: true,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground wrap-break-word text-wrap w-full">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
