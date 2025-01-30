import dotenv from "dotenv";

import { Keypair } from "@solana/web3.js";

import getTPSAction from "./getTPS";
import { TestHarness } from "../../../test/utils/testHarness";

dotenv.config();

async function testTPS(harness: TestHarness) {
  await harness.runTest("Get TPS", async (agent) => {
    const result = await getTPSAction.handler(agent, {});
    if (result.tps < 100) {
      throw new Error("TPS was expected to be defined, but was " + result.tps);
    }
  });
}

async function runTests() {
  const harness = new TestHarness({
    privateKey: Keypair.generate().secretKey,
  });
  try {
    await testTPS(harness);
  } finally {
    harness.cleanup();
    process.exit(harness.shouldFail ? 1 : 0);
  }
}

runTests();
