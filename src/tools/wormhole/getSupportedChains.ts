/**
 * USDC contract addresses for different chains across Mainnet and Testnet networks
 * This data is used to determine which chains and networks are supported for Wormhole operations
 */
const usdcContracts = [
  [
    "Mainnet",
    [
      ["Ethereum", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
      ["Avalanche", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"],
      ["Optimism", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"],
      ["Arbitrum", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"],
      ["Solana", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
      ["Base", "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"],
      ["Polygon", "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"],
    ],
  ],
  [
    "Testnet",
    [
      ["Sepolia", "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"],
      ["Avalanche", "0x5425890298aed601595a70AB815c96711a31Bc65"],
      ["OptimismSepolia", "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"],
      ["ArbitrumSepolia", "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"],
      ["Solana", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"],
      ["BaseSepolia", "0x036CbD53842c5426634e7929541eC2318f3dCF7e"],
      ["Polygon", "0x9999f7fea5938fd3b1e26a12c3f2fb024e194f97"],
    ],
  ],
];

/**
 * Retrieves a list of chains supported by Wormhole for cross-chain operations
 *
 * @returns {Promise<string>} A JSON string containing an array of supported chains with their network, chain name, and USDC address
 *
 * Example return value:
 * [
 *   { "network": "Mainnet", "chain": "Ethereum", "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
 *   { "network": "Mainnet", "chain": "Solana", "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
 *   ...
 * ]
 */
export const getWormholeSupportedChains = async () => {
  const supportedChains = [];
  for (const [network, chains] of usdcContracts) {
    for (const [chain, address] of chains) {
      supportedChains.push({
        network,
        chain,
        address,
      });
    }
  }
  return JSON.stringify(supportedChains);
};
