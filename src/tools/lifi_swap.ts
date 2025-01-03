import {
    VersionedTransaction,
    PublicKey,
    LAMPORTS_PER_SOL,
  } from "@solana/web3.js";
  import { SolanaAgentKit } from "../index";
  import { Buffer } from 'buffer';
  import { TOKENS, DEFAULT_OPTIONS, LIFISWAP_API } from "../constants";
  
  export async function lifi_swap(
    agent: SolanaAgentKit,
    outputMint: PublicKey,
    inputAmount: number,
    inputMint: PublicKey,
  ): Promise<string> {
      try {
          const fetchWithRetry = async (url: string, options: any, retries = 3): Promise<Response> => {
              for (let i = 0; i < retries; i++) {
                  try {
                      const response = await fetch(url, {
                          ...options,
                          timeout: 10000,
                      });
                      return response;
                  } catch (error) {
                      if (i === retries - 1) throw error;
                      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                  }
              }
              throw new Error("Failed to fetch after retries");
          };
  
          const response = await fetchWithRetry(
              `${LIFISWAP_API}quote?fromChain=SOL&toChain=SOL` +
              `&fromToken=${inputMint.toString()}` +
              `&toToken=${outputMint.toString()}` +
              `&fromAddress=${agent.wallet_address}` +
              `&fromAmount=${inputAmount * LAMPORTS_PER_SOL}`,
              {
                  method: 'GET',
                  headers: {
                      accept: 'application/json',
                      'x-lifi-api-key': process.env.LIFI_API_KEY || ''
                  }
              }
          );
  
          const quoteResponse = await response.json();
  
          const decodedTx = Buffer.from(quoteResponse.transactionRequest.data.toString(), 'base64');
          
          const deserializedTx = VersionedTransaction.deserialize(decodedTx);
  
          const { blockhash } = await agent.connection.getLatestBlockhash();
          deserializedTx.message.recentBlockhash = blockhash;
  
          deserializedTx.sign([agent.wallet]);
          const signature = await agent.connection.sendTransaction(deserializedTx);
  
          return signature;
      } catch (error) {
          console.error("Error swapping tokens:", error);
          return "";
      }
  }