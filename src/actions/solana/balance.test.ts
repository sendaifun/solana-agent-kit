import dotenv from "dotenv";

import balanceAction from "./balance";

import { TestHarness } from "../../../test/utils/testHarness";
import { Keypair } from "@solana/web3.js";

dotenv.config();

async function testBalance(harness: TestHarness) {
  await harness.runTest("Get balance", async (agent) => {
    const result = await balanceAction.handler(agent, {});
    if (result.balance !== 0) {
      throw new Error(
        "Balance was expected to be 0, but was " + result.balance,
      );
    }
  });
}

async function runTests() {
  const harness = new TestHarness({
    privateKey: Keypair.generate().secretKey,
  });
  try {
    await testBalance(harness);
  } finally {
    harness.cleanup();
    process.exit(harness.shouldFail ? 1 : 0);
  }
}

runTests();
