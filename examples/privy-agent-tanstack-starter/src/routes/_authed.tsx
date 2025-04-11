import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchSession } from "~/functions/session";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const session = await fetchSession();

    if (!session?.email && !session?.walletAddress) {
      throw redirect({
        to: "/",
        search: {
          errMsg:
            "Privy not connected. Please connect to Privy before accessing chats",
        },
      });
    }
  },
});
