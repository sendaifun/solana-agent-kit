import {
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import {
  PumpSdk,
  BondingCurve,
  getBuySolAmountFromTokenAmount,
} from "@pump-fun/pump-sdk";
import { PinataSDK } from "pinata";

/**
 * Launch a token on Pump.fun
 * @param agent - SolanaAgentKit instance
 * @param tokenName - Name of the token
 * @param tokenTicker - Ticker of the token
 * @param description - Description of the token
 * @param imageUrl - URL of the token image
 * @param amount - Amount of tokens to mint
 * @param  twitter - Twitter handle (optional)
 * @param telegram - Telegram group link (optional)
 * @param website - Website URL (optional)
 * @returns - Signature of the transaction, mint address and metadata URI, if successful, else error
 */
export default async function launchPumpFunToken(
  agent: SolanaAgentKit,
  name: string,
  symbol: string,
  description: string,
  imageUrl: string,
  amount: number,
  twitter?: string,
  telegram?: string,
  website?: string,
): Promise<{ signedTransaction: string } | { txHash: string | VersionedTransaction | Transaction | string[] | Transaction[] | VersionedTransaction[], mint: string, metadataUri: string }> {
  try {

    if (!agent.config.PINATA_JWT) {
      throw new Error("PINATA_JWT is not set");
    }

    const pumpSdk = new PumpSdk(agent.connection);
    const mint = Keypair.generate();

    let REFERRAL_WALLET = new PublicKey(
      "FPfGD3kA8ZXWWMTZHLcFDMhVzyWhqstbgTpg1KoR7Vk4",
    );
    if (agent.config.PUMP_FUN_REFERRAL_WALLET) {
      REFERRAL_WALLET = new PublicKey(agent.config.PUMP_FUN_REFERRAL_WALLET);
    }

    const metadata = {
      name: name,
      symbol: symbol,
      description: description,
      image: imageUrl,
      showName: true,
      createdOn: "https://www.sendai.fun",
      twitter: twitter,
      telegram: telegram,
      website: website,
    };

    const metadataUri = await uploadJsonToPinata(agent, metadata);

    const ix = await pumpSdk.createInstruction(
      mint.publicKey,
      metadata.name,
      metadata.symbol,
      metadataUri,
      REFERRAL_WALLET,
      agent.wallet.publicKey,
    );

    const global = await pumpSdk.fetchGlobal();

    const bondingCurve: BondingCurve = {
      virtualTokenReserves: global.initialVirtualTokenReserves,
      virtualSolReserves: global.initialVirtualSolReserves,
      realTokenReserves: global.initialRealTokenReserves,
      realSolReserves: new BN(0),
      tokenTotalSupply: new BN(global.tokenTotalSupply),
      complete: false,
      creator: agent.wallet.publicKey,
    };

    const buy_sol_amount = getBuySolAmountFromTokenAmount(
      global,
      bondingCurve,
      new BN(amount),
      true,
    );

    const buy_ix = await pumpSdk.buyInstructions(
      global,
      null,
      bondingCurve,
      mint.publicKey,
      agent.wallet.publicKey,
      new BN(amount),
      buy_sol_amount,
      1,
      REFERRAL_WALLET,
    );
    const { blockhash } = await agent.connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: agent.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [ix, ...buy_ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);

    if (agent.config.signOnly) {
      const agentSignedTx = await agent.wallet.signTransaction(tx);
      return {
        signedTransaction: Buffer.from(agentSignedTx.serialize()).toString("base64"),
      };
    } else {
      const txHash = await signOrSendTX(agent, tx);
      return {
        txHash: txHash,
        mint: mint.publicKey.toBase58(),
        metadataUri: metadataUri,
      };
    }
  } catch (error) {
    console.error("Error in launchpumpfuntoken:", error);
    if (error instanceof Error && "logs" in error) {
      console.error("Transaction logs:", (error as any).logs);
    }
    throw error;
  }
}

/**
 * Upload a JSON object to Pinata IPFS
 * @param json - The JSON object to upload
 * @returns - The IPFS link to the uploaded content
 */
export type UploadResponse = {
  id: string;
  name: string;
  cid: string;
  size: number;
  created_at: string;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
  keyvalues: {
    [key: string]: string;
  };
  vectorized: boolean;
  network: string;
};

export async function uploadJsonToPinata(
  agent: SolanaAgentKit,
  json: Record<string, any>,
): Promise<string> {
  console.table({
    pinataJwt: agent.config.PINATA_JWT!,
    pinataGateway:
      agent.config.PINATA_GATEWAY || "example-gateway.mypinata.cloud",
  });
  const pinata = new PinataSDK({
    pinataJwt: agent.config.PINATA_JWT!,
    pinataGateway:
      agent.config.PINATA_GATEWAY || "example-gateway.mypinata.cloud",
  });
  try {
    const upload: UploadResponse = await pinata.upload.public.json(json);
    // Return the IPFS link using the returned cid
    return `https://ipfs.io/ipfs/${upload.cid}`;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}