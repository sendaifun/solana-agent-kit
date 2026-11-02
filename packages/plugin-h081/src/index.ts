/// <reference path="./sdk/types.d.ts" />
// @solana-agent-kit/plugin-h081: H081 Capital (the private bank for AI agents on Solana) for Solana Agent Kit v2.
//
//   import { SolanaAgentKit, KeypairWallet, createVercelAITools } from 'solana-agent-kit';
//   import H081Plugin from '@solana-agent-kit/plugin-h081';
//   const agent = new SolanaAgentKit(new KeypairWallet(keypair, rpc), rpc, {}).use(H081Plugin);
//   const tools = createVercelAITools(agent, agent.actions);          // or createLangchainTools / createOpenAITools
//   await agent.methods.h081BankDeposit(agent, { usdg: "25" });      // or call the methods directly
//
// Live on Solana mainnet; not audited yet; use at your own risk.
import type { Plugin, SolanaAgentKit } from "solana-agent-kit";
import { bankBalanceAction } from "./actions/bankBalance.js";
import { bankDepositAction } from "./actions/bankDeposit.js";
import { bankWithdrawAction } from "./actions/bankWithdraw.js";
import { loanBorrowAction } from "./actions/loanBorrow.js";
import { loanQuoteAction } from "./actions/loanQuote.js";
import { protocolInfoAction } from "./actions/protocolInfo.js";
import { stakeAction } from "./actions/stake.js";
import { METHODS } from "./tools/index.js";

export const H081_ACTIONS = [
  bankDepositAction,
  bankWithdrawAction,
  bankBalanceAction,
  loanQuoteAction,
  loanBorrowAction,
  stakeAction,
  protocolInfoAction,
];

const H081Plugin = {
  name: "h081",
  methods: { ...METHODS },
  actions: H081_ACTIONS,
  initialize(_agent: SolanaAgentKit): void {
    // nothing to prepare: the bank opens on the first call (the key is read then, so a missing key is an error
    // the model can read rather than a crash at startup)
  },
} satisfies Plugin;

export default H081Plugin;
export { H081Plugin };
export {
  bankDepositAction,
  bankWithdrawAction,
  bankBalanceAction,
  loanQuoteAction,
  loanBorrowAction,
  stakeAction,
  protocolInfoAction,
};
export {
  h081BankDeposit,
  h081BankWithdraw,
  h081BankBalance,
  h081LoanQuote,
  h081LoanBorrow,
  h081Stake,
  h081ProtocolInfo,
} from "./tools/index.js";
export {
  signerFromAgent,
  keypairOfWallet,
  UNSUPPORTED_WALLET,
} from "./signer.js";
export {
  bankFor,
  setBankProvider,
  resetBank,
  type BankProvider,
  type AgentLike,
} from "./bank.js";
export { H081Bank, type BankOptions } from "./core/bank.js";
export { openFromEnv, AutoFetchProver } from "./core/open.js";
export {
  configFromEnv,
  MAINNET,
  NOTICE,
  ENV_VARS,
  type H081Config,
} from "./core/constants.js";
export { explainProgramError, H081Error } from "./core/errors.js";
export {
  OPS,
  DESCRIPTIONS,
  ZOD,
  JSON_SCHEMA,
  type OpName,
} from "./core/schemas.js";
export { runOp, plain, type BankLike } from "./core/operations.js";
