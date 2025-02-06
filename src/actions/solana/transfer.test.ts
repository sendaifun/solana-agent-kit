import dotenv from "dotenv";

import transferAction from "./transfer";

import { TestHarness } from "../../../test/utils/testHarness";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { describe, beforeAll, afterAll, test } from "vitest";
import { expect } from "chai";

dotenv.config();

describe.sequential("Transfer Action", () => {
  let harness: TestHarness;

  beforeAll(async () => {
    harness = new TestHarness({
      privateKey: Keypair.generate().secretKey,
    });

    await harness.setup();
  });

  test("transfer sol test", async () => {
    const toKey = Keypair.generate().publicKey.toBase58();

    harness.sponsorFundInSimulation = {
      lamports: LAMPORTS_PER_SOL,
      toKey: harness.agent.wallet_address.toBase58(),
    };

    const result = await transferAction.handler(harness.agent, {
      to: toKey,
      amount: 1,
    });

    expect(result.status).to.equal("success");
  });

  afterAll(async () => {
    await harness.cleanup();
  });
});
