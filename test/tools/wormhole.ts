import "dotenv/config";
import { SolanaAgentKit, createSolanaTools } from "../../src";

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
);

(async () => {
  // const supportedChains = await agent.getWormholeSupportedChains();
  // console.log(supportedChains);

  const transfer = await agent.cctpTransfer({
    destinationChain: "BaseSepolia",
    transferAmount: "1",
    network: "Testnet",
  });
  console.log(transfer);

  // const createWrappedToken = await agent.createWrappedToken({
  //   destinationChain: "BaseSepolia",
  //   network: "Testnet",
  //   tokenAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  // });
  // console.log(createWrappedToken);
})();
