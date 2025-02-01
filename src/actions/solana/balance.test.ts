import dotenv from "dotenv";
import { afterAll, beforeAll, test, describe } from "vitest";

import balanceAction from "./balance";
import { Keypair } from "@solana/web3.js";

import { TestHarness } from "../../../test/utils/testHarness";

dotenv.config();

let harness: TestHarness;

describe.sequential("Balance Action", () => {
  beforeAll(async () => {
    harness = new TestHarness({
      privateKey: Keypair.generate().secretKey,
    });

    await harness.setup();
  });

  test("get balance", async () => {
    const result = await balanceAction.handler(harness.agent, {});
    if (result.balance !== 0) {
      throw new Error(
        "Balance was expected to be 0, but was " + result.balance,
      );
    }
  });

  afterAll(async () => {
    await harness.cleanup();
  });
});
