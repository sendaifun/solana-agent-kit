import dotenv from "dotenv";

import transferAction from "./transfer";

import { TestHarness } from "../../../test/utils/testHarness";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

dotenv.config();

async function testTransfer(harness: TestHarness) {
  await harness.runTest("Transfer", async (agent) => {
    const toKey = Keypair.generate().publicKey.toBase58();
    harness.sponsorFundInSimulation = {
      lamports: LAMPORTS_PER_SOL,
      toKey: harness.agent.wallet_address.toBase58(),
    };
    const result = await transferAction.handler(agent, {
      to: toKey,
      amount: 1,
    });
    if (result.status !== "success") {
      throw new Error("Transfer failed");
    }
  });
}

async function runTests() {
  const harness = new TestHarness({
    privateKey: Keypair.generate().secretKey,
  });
  try {
    await testTransfer(harness);
  } finally {
    harness.cleanup();
    process.exit(harness.shouldFail ? 1 : 0);
  }
}

runTests();
