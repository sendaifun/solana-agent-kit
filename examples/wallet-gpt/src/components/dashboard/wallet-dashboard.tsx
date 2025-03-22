"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBalance, getLastXTransactions } from "@/utils/helper";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  ArrowUpRight,
  Check,
  Clock,
  ExternalLink,
  Plus,
  Repeat,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./wallet-style.css";
import { Badge } from "../ui/badge";

export function WalletDashboard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const getUserSOLBalance = async () => {
    if (!publicKey) return;
    let balance = await getBalance(publicKey.toString(), connection);
    let transactions = await getLastXTransactions(
      publicKey.toString(),
      connection,
      5,
    );
    balance = balance / LAMPORTS_PER_SOL;
    setBalance(balance);
    setTransactions(transactions);
  };

  useEffect(() => {
    getUserSOLBalance();
  }, [publicKey, transactions]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col gap-4"
    >
      <Card className="p-6 backdrop-blur-xl text-white bg-black/40 border-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="relative flex justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">
              <span>Total Balance</span>
              <Badge className="bg-blue-500/40 ml-1">Devnet Only</Badge>
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
            >
              {balance.toFixed(4)} SOL
            </motion.div>
            <div className="text-green-400 text-sm mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +2.5%
            </div>
          </div>
          <div className="z-50 cursor-pointer">
            <WalletMultiButton
              style={{
                color: "white",
                fontWeight: "600",
                borderRadius: "0.5rem",
                border: "1px solid #581c87",
                background:
                  "linear-gradient(to right, #1e3a8a33, #00000020, #581c8733)",
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="backdrop-blur-xl bg-black/40 border-purple-500/20 hover:bg-purple-500/20 hover:text-white transition-all duration-300"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
        <Button
          variant="outline"
          className="backdrop-blur-xl bg-black/40 border-purple-500/20 hover:bg-purple-500/20 hover:text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buy
        </Button>
        <Button
          variant="outline"
          className="backdrop-blur-xl bg-black/40 border-purple-500/20 hover:bg-purple-500/20 hover:text-white transition-all duration-300"
        >
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Swap
        </Button>
      </div>

      <Card className="flex-1 backdrop-blur-xl bg-black/40 text-white border-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Button variant="ghost" size="icon">
              <Clock className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <motion.div
                key={tx.signature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <Repeat className="w-4 h-4 mr-2 transform rotate-90" />
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.signature.slice(0, 8) + "..." + tx.signature.slice(-8)}
                  </div>
                  <div>
                    <Check
                      className={`w-4 h-4 mr-2 ${tx.confirmationStatus === "finalized" ? "text-green-400" : "text-yellow-400"}`}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tx.amount}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(tx.blockTime * 1000).toDateString() +
                      " " +
                      new Date(tx.blockTime * 1000).toLocaleTimeString()}
                  </div>
                  <ExternalLink
                    className="w-5 h-5 text-gray-400 float-end clear-both my-2 cursor-pointer hover:opacity-80"
                    onClick={() =>
                      window.open(
                        `https://solscan.io/tx/${tx.signature}?cluster=devnet`,
                        "_blank",
                      )
                    }
                  />
                </div>
              </motion.div>
            ))}
            {!publicKey && (
              <div className="text-center text-md text-gray-400">
                Connect your wallet to see your transactions
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
