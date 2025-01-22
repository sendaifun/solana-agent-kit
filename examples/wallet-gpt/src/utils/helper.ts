import { Connection, PublicKey } from "@solana/web3.js";

export const getBalance = async (publicKey: string, connection: Connection) => {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance;
};

export const getLastXTransactions = async (
  publicKey: string,
  connection: Connection,
  limit: number,
) => {
  const transactions = await connection.getSignaturesForAddress(
    new PublicKey(publicKey),
    {
      limit,
    },
  );
  return transactions;
};
