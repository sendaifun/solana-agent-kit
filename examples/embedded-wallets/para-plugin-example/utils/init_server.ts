import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection,VersionedTransaction, Transaction, PublicKey, SendOptions } from "@solana/web3.js";
import {solanaAgent} from "./solana";
import ParaServerPlugin from "solana-plugin-para-server";
import TokenPlugin from "@solana-agent-kit/plugin-token";
export const solanaAgentWithPara = solanaAgent.use(ParaServerPlugin).use(TokenPlugin);
export async function useWallet(userShare: string,walletId: string,session: string) {
    try {
      if(!userShare){
        throw new Error("Provide `userShare` in the request body to use a wallet.");
      }
      const para = solanaAgentWithPara.methods.getParaInstance();
    
      const solanaConnection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
      await para.importSession(session);
  await para.setUserShare(userShare);
      // Create the Para Solana Signer
      const solanaSigner = new ParaSolanaWeb3Signer(para as any, solanaConnection, walletId);
    //   console.log("solanaSigner",solanaSigner.sender?.toBase58())
      solanaAgentWithPara.wallet = {
        publicKey: solanaSigner.sender as PublicKey,
        // Implements BaseWallet.sendTransaction with generic T
        sendTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<string> => {
          if (tx instanceof VersionedTransaction) {
            const signed = await solanaSigner.signVersionedTransaction(tx) as T;
            return await solanaSigner.sendTransaction(signed);
          }
          return await solanaSigner.sendTransaction(tx);
        },
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          if (tx instanceof VersionedTransaction) {
            return await solanaSigner.signVersionedTransaction(tx) as T;
          } else {
            return await solanaSigner.signTransaction(tx) as T;
          }
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          const signedTxs = await Promise.all(txs.map(async (tx) => {
            if (tx instanceof VersionedTransaction) {
              return await solanaSigner.signVersionedTransaction(tx) as T;
            } else {
              return await solanaSigner.signTransaction(tx) as T;
            }
          }));
          return signedTxs;
        },
        // Implements BaseWallet.signAndSendTransaction
        signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<{ signature: string }> => {
          let signedTx: T;
          if (transaction instanceof VersionedTransaction) {
            signedTx = await solanaSigner.signVersionedTransaction(transaction) as T;
          } else {
            signedTx = await solanaSigner.signTransaction(transaction) as T;
          }
          const signature = await solanaSigner.sendTransaction(signedTx);
          return { signature };
        },
        // Implements BaseWallet.signMessage
        signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
          if (typeof (solanaSigner as any).signMessage === "function") {
            return await (solanaSigner as any).signMessage(message);
          }
          throw new Error("signMessage not supported");
        }
      };
  
    
    } catch (error: any) {
      throw new Error(`use wallet failed ${error.message}`);
    }
  }
