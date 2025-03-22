import { z } from "zod";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";

export const getWormholeSupportedChainsAction: Action = {
  name: "GET_WORMHOLE_SUPPORTED_CHAINS",
  description: "Get a list of supported chains by Wormhole Protocol",
  similes: [
    "get supported chains",
    "get wormhole supported chains",
    "get wormhole chains",
    "list all the chains i can bridge to ",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          chains: [
            {
              network: "Mainnet",
              chain: "Ethereum",
              address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            {
              network: "Mainnet",
              chain: "Avalanche",
              address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            },
            {
              network: "Mainnet",
              chain: "Optimism",
              address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            },
            {
              network: "Mainnet",
              chain: "Arbitrum",
              address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            },
            {
              network: "Mainnet",
              chain: "Solana",
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            },
            {
              network: "Mainnet",
              chain: "Base",
              address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            },
            {
              network: "Mainnet",
              chain: "Polygon",
              address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
            },
            {
              network: "Testnet",
              chain: "Sepolia",
              address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            },
            {
              network: "Testnet",
              chain: "Avalanche",
              address: "0x5425890298aed601595a70AB815c96711a31Bc65",
            },
            {
              network: "Testnet",
              chain: "OptimismSepolia",
              address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
            },
            {
              network: "Testnet",
              chain: "ArbitrumSepolia",
              address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
            },
            {
              network: "Testnet",
              chain: "Solana",
              address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
            },
            {
              network: "Testnet",
              chain: "BaseSepolia",
              address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            },
            {
              network: "Testnet",
              chain: "Polygon",
              address: "0x9999f7fea5938fd3b1e26a12c3f2fb024e194f97",
            },
          ],
        },
        explanation: "Get a list of supported chains by Wormhole Protocol",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    const response = await agent.getWormholeSupportedChains();
    return { chains: JSON.parse(response) };
  },
};

export default getWormholeSupportedChainsAction;
