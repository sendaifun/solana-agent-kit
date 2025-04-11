import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { usePrivy, } from "@privy-io/react-auth";
import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "./Toast";
import { toast as sonnerToast } from "sonner";
import PrivyButton from "./PrivyButton";
import { fetchSession, logoutFn, signupFn } from "~/functions/session";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function UserLoginButton() {
  const { logout, authenticated, user, ready } = usePrivy();
  const nav = useNavigate();
  const [_, copyToClipboard] = useCopyToClipboard();

  useEffect(() => {
    // Note: Sign up or log in the user once authenticated state changes to true. This is a patch until Privy provides login callbacks
    if (ready && authenticated) {
      fetchSession().then((v) => {
        if (v?.email || v?.walletAddress) {
          return;
        }

        signupFn({
          data: {
            walletAddress: user?.wallet?.address as string,
            email: user?.email?.address,
            redirectUrl: "/chats",
          },
        }).then((v) => {
          if (v.error) {
            return toast({
              type: "error",
              description: v.message,
            });
          }

          nav({ href: "/chats" });
        });
      });
    }
  }, [authenticated, ready, user]);

  return (
    <>
      {authenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <CircleUser />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              {user?.email?.address ?? user?.wallet?.address}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (user?.wallet?.address) {
                  copyToClipboard(user?.wallet?.address);
                  toast({
                    type: "success",
                    description: `Copied ${user?.wallet?.address} to clipboard`,
                  });
                } else
                  toast({
                    type: "error",
                    description: "No wallet address found",
                  });
              }}
            >
              Copy Address
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                sonnerToast.promise(
                  async () => {
                    await logout();
                    await logoutFn();
                    nav({ href: "/", replace: true });
                  },
                  {
                    description: "Disconnecting Privy...",
                  },
                )
              }
            >
              Disconnect Privy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <PrivyButton />
      )}
    </>
  );
}
