import dotenv from "dotenv";

import { Keypair } from "@solana/web3.js";

import getTPSAction from "./getTPS";
import { TestHarness } from "../../../test/utils/testHarness";
import { afterAll, beforeAll, test, describe } from "vitest";

dotenv.config();

let harness: TestHarness;
describe.sequential("Get TPS Action", () => {
  beforeAll(async () => {
    harness = new TestHarness({
      privateKey: Keypair.generate().secretKey,
    });

    await harness.setup();
  });

  test("get tps", async () => {
    const result = await getTPSAction.handler(harness.agent, {});
    if (result.tps < 100) {
      throw new Error("TPS was expected to be defined, but was " + result.tps);
    }
  });

  afterAll(async () => {
    await harness.cleanup();
  });
});
