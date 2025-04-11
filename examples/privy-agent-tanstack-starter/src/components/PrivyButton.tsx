import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "./Toast";

export default function PrivyButton() {
  const { ready, login, authenticated, user } = usePrivy();
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <Button
      disabled={!ready}
      onClick={() => {
        if (authenticated) {
          if (user?.wallet?.address) {
            copyToClipboard(user?.wallet?.address);
            toast({
              type: "success",
              description: `Copied ${user?.wallet?.address} to clipboard`,
            });
          } else
            toast({ type: "error", description: "No wallet address found" });
        } else {
          try {
            login();
          } catch (e) {
            toast({ type: "error", description: "Login failed" });
          }
        }
      }}
    >
      {authenticated ? user?.wallet?.address : "Connect Privy"}
    </Button>
  );
}
