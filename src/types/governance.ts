import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Vote, VoteChoice } from "governance-idl-sdk";

export { Vote, VoteChoice };

export interface RealmConfig {
  name: string;
  councilMint?: PublicKey | undefined;
  communityMint: PublicKey;
  minCommunityTokensToCreateGovernance: number;
  communityTokenConfig?: {
    tokenType: "liquid" | "membership" | "dormant";
    maxVotingPower?: number;
  };
}

export interface ProposalConfig {
  name: string;
  description: string;
  governingTokenMint: PublicKey;
  voteType: "single-choice" | "multiple-choice";
  options: string[];
  executionTime?: number;
}

export interface VoteConfig {
  realm: PublicKey;
  proposal: PublicKey;
  choice: number;
  tokenAmount?: number;
  governingTokenMint: PublicKey;
  tokenOwner?: PublicKey;
  governance: PublicKey;
}

export type VoteType = {
  choiceType: "single" | "multi";
  multiChoiceOptions: {
    choiceType: "fullWeight" | "weighted";
    minVoterOptions: number;
    maxVoterOptions: number;
    maxWinningOptions: number;
  } | null;
};
