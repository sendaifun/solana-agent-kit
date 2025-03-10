import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const getPoppins = Poppins({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Agent GPT",
  description: "An AI powered wallet for Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${getPoppins.className}`}
      >
        {children}
      </body>
    </html>
  );
}
