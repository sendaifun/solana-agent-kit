import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { SolanaAgentKit } from "@packages/core/dist";
import { PublicKey } from "@solana/web3.js";

export function initUmi(agent: SolanaAgentKit) {
  const umi = createUmi(agent.connection.rpcEndpoint)
    .use(mplCore())
    .use(mplToolbox());
  umi.identity = {
    publicKey: fromWeb3JsPublicKey(agent.wallet.publicKey),
    // @ts-expect-error Umi types are not compatible with SolanaAgentKit
    signTransaction: agent.wallet.signTransaction,
    // @ts-expect-error Umi types are not compatible with SolanaAgentKit
    signAllTransactions: agent.wallet.signAllTransactions,
    signMessage: agent.wallet.signMessage,
  };
  umi.payer = umi.identity;

  return umi;
}
