import {
  ChainAddress,
  ChainContext,
  Network,
  Signer,
  Wormhole,
  Chain,
  TokenId,
  isTokenId,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { config } from "dotenv";
config();

/**
 * Interface representing a signer for a specific blockchain
 *
 * @template N - Network type (Mainnet, Testnet, Devnet)
 * @template C - Chain type (Solana, Ethereum, etc.)
 *
 * @property {ChainContext<N, C>} chain - The chain context
 * @property {Signer<N, C>} signer - The signer for the chain
 * @property {ChainAddress<C>} address - The address of the signer
 */
export interface SignerStuff<N extends Network, C extends Chain> {
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}

/**
 * Retrieves an environment variable
 *
 * @param {string} key - The name of the environment variable
 * @returns {string} The value of the environment variable
 * @throws {Error} If the environment variable is not set
 */
function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return val;
}

/**
 * Creates a signer for a specific blockchain
 *
 * This function handles the creation of signers for different blockchain platforms
 * (Solana, EVM, Sui, Aptos) using private keys from environment variables.
 *
 * @template N - Network type (Mainnet, Testnet, Devnet)
 * @template C - Chain type (Solana, Ethereum, etc.)
 *
 * @param {ChainContext<N, C>} chain - The chain context
 * @param {bigint} [gasLimit] - Optional gas limit for EVM chains
 *
 * @returns {Promise<SignerStuff<N, C>>} The signer, chain context, and address
 * @throws {Error} If the platform is not supported or if required environment variables are missing
 */
export async function getSigner<N extends Network, C extends Chain>(
  chain: ChainContext<N, C>,
  gasLimit?: bigint,
): Promise<{
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}> {
  let signer: Signer;
  const platform = chain.platform.utils()._platform;

  switch (platform) {
    case "Solana":
      signer = await (
        await solana()
      ).getSigner(await chain.getRpc(), getEnv("SOLANA_PRIVATE_KEY"));
      break;
    case "Evm": {
      const evmSignerOptions = gasLimit ? { gasLimit } : {};
      signer = await (
        await evm()
      ).getSigner(
        await chain.getRpc(),
        getEnv("ETH_PRIVATE_KEY"),
        evmSignerOptions,
      );
      break;
    }
    case "Sui":
      signer = await (
        await sui()
      ).getSigner(await chain.getRpc(), getEnv("SUI_MNEMONIC"));
      break;

    case "Aptos":
      signer = await (
        await aptos()
      ).getSigner(await chain.getRpc(), getEnv("APTOS_PRIVATE_KEY"));
      break;
    default:
      throw new Error("Unsupported platform: " + platform);
  }

  return {
    chain,
    signer: signer as Signer<N, C>,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}

export async function getTokenDecimals<
  N extends "Mainnet" | "Testnet" | "Devnet",
>(
  wh: Wormhole<N>,
  token: TokenId,
  sendChain: ChainContext<N, any>,
): Promise<number> {
  return isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : sendChain.config.nativeTokenDecimals;
}
