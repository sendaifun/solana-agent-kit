import { makeAction } from "./factory.js";

export const stakeAction = makeAction({
  op: "h081_stake",
  name: "H081_STAKE",
  similes: [
    "stake h081",
    "unstake h081",
    "h081 staking position",
    "capacity stake",
    "request unstake h081",
  ],
  examples: [
    [
      {
        input: { action: "view" },
        output: {
          status: "success",
          walletH081: "1000000000",
          staked: "0",
          pending: "0",
          readyAt: "0",
          desks: "0",
          shieldCap: "0",
          totalStaked: "0",
          caps: {
            maxPerStake: "100000000000",
            maxTotal: "1000000000000",
            paused: false,
          },
          cooldownDays: 30,
        },
        explanation: "The agent wallet's H081 and its staking position.",
      },
      {
        input: { action: "stake", h081: "100" },
        output: {
          status: "success",
          signature: "3fT…",
          staked: "100000000",
          desks: "1",
          shieldCap: "10000000000",
        },
        explanation:
          "Stake 100 H081 for relayer capacity (desks and shield capacity).",
      },
      {
        input: { action: "request_unstake", amount: "100000000" },
        output: {
          status: "success",
          signature: "7kL…",
          staked: "0",
          pending: "100000000",
          readyAt: "1764000000",
        },
        explanation: "Start the 30-day cooldown on 100 H081 (base units).",
      },
      {
        input: { action: "unstake" },
        output: {
          status: "success",
          signature: "9pM…",
          pending: "0",
          walletH081: "1000000000",
        },
        explanation:
          "After the cooldown, move the pending H081 back to the wallet.",
      },
    ],
  ],
});
