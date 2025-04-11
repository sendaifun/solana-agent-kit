import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";
import { NotFound } from "~/components/NotFound.js";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo.js";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import UserLoginButton from "~/components/UserLoginButton";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Privy Solana Agent",
        description:
          "Privy Solana Agent is a web app that enables you to interact with the Solana blockchain through simple language. Swap, transfer, and stake with ease.",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID}
          clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
          config={{
            // Display email and wallet as login methods
            loginMethods: ["email", "wallet"],
            externalWallets: {
              solana: { connectors: toSolanaWalletConnectors() },
            },
            appearance: {
              theme: "dark",
              accentColor: "#676FFF",
              // logo: "https://your-logo-url",
              walletChainType: "solana-only",
              walletList: ["detected_solana_wallets"],
            },
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
              ethereum: { createOnLogin: "off" },
              solana: { createOnLogin: "users-without-wallets" },
            },
          }}
        >
          <div className="p-2 flex gap-2 text-lg">
            <Link
              to="/"
              activeProps={{
                className: "font-bold",
              }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>{" "}
            <Link
              to="/chats"
              preload={false}
              activeProps={{
                className: "font-bold",
              }}
            >
              Chats
            </Link>
            <div className="ml-auto">
              <UserLoginButton />
            </div>
          </div>
          <hr />
          <Toaster position="top-center" />
          {children}
        </PrivyProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
