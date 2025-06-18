import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { magicedenClient } from "../constants";
import { VersionedTransaction } from "@solana/web3.js";

/**
 * List an NFT on Magic Eden
 * @param agent SolanaAgentKit instance
 * @param tokenMint The mint address of the NFT to list
 * @param tokenAccount The token account address of the NFT to list
 * @param price The price in SOL to list the NFT for
 * @param options Optional parameters for auction house address and seller referral
 * @returns
 */
export async function list_nft_on_magiceden(
  agent: SolanaAgentKit,
  tokenMint: string,
  tokenAccount: string,
  price: number,
  options: {
    auctionHouseAddress?: string;
    sellerReferral?: string;
  } = {},
) {
  try {
    if (!agent.config.MAGIC_EDEN_API_KEY) {
      throw new Error("Magic Eden API key is required to list NFTs");
    }

    const res = await magicedenClient.get("/instructions/list", {
      params: {
        seller: agent.wallet.publicKey.toBase58(),
        tokenMint,
        price,
        tokenAccount,
        auctionHouseAddress: options.auctionHouseAddress || null,
        sellerReferral: options.sellerReferral || null,
      },
      headers: {
        Authorization: `Bearer ${agent.config.MAGIC_EDEN_API_KEY}`,
      },
    });

    if (!res.data || !res.data.tx || !res.data.txSigned) {
      throw new Error("Invalid response from Magic Eden API");
    }

    const txBuffer = new Uint8Array(res.data.txSigned.data);
    const tx = VersionedTransaction.deserialize(txBuffer);
    const result = await signOrSendTX(agent, tx);

    if (agent.config.signOnly) {
      return {
        signedTransaction: result as VersionedTransaction,
      };
    }

    return {
      signature: result as string,
    };
  } catch (e: any) {
    throw new Error(`Failed to list NFT on Magic Eden: ${e.message}`);
  }
}
