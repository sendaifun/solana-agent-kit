import { SolanaAgentKit } from "../src";
import { TOKENS } from "../src/constants";
import { PublicKey } from "@solana/web3.js";
import assert from "assert";

export async function test_lifi_swap() {
    console.log("<<< Test Lifi Swap");

    const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY!
    );

    // Test swapping SOL to USDC
    const inputAmount = 0.1; // 0.1 SOL
    const signature = await solanaKit.lifiswap(
        TOKENS.USDC,
        inputAmount,
        TOKENS.SOL
    );

    // Verify the transaction was successful
    assert(signature !== "", "Swap transaction failed");
    console.log(`View transaction: https://solana.fm/tx/${signature}`);

    console.log(">>> Test Lifi Swap Passed");
}

// Run the test
if (require.main === module) {
    test_lifi_swap()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}