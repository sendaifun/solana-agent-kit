import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { SplGovernance } from "governance-idl-sdk";
import { BN } from "@coral-xyz/anchor";
import {
  RealmConfig,
  ProposalConfig,
  VoteConfig,
  VoteType,
  Vote,
  VoteChoice,
} from "../types/governance";
import { SolanaAgentKit } from "../agent";

export async function createNewRealm(
  agent: SolanaAgentKit,
  config: RealmConfig,
): Promise<PublicKey> {
  const splGovernance = new SplGovernance(agent.connection);

  const createRealmIx = await splGovernance.createRealmInstruction(
    config.name,
    config.communityMint,
    config.minCommunityTokensToCreateGovernance,
    agent.wallet.publicKey,
    undefined, // communityMintMaxVoterWeightSource
    config.councilMint,
    config.communityTokenConfig?.tokenType || "liquid",
    "membership", // councilTokenType
  );

  const transaction = new Transaction().add(createRealmIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return new PublicKey(signature);
}

export async function createNewProposal(
  agent: SolanaAgentKit,
  realm: PublicKey,
  config: ProposalConfig,
): Promise<PublicKey> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get the governance account for the realm
  const governanceAccounts =
    await splGovernance.getGovernanceAccountsByRealm(realm);
  if (!governanceAccounts.length) {
    throw new Error("No governance account found for realm");
  }

  const governance = governanceAccounts[0];

  // Get token owner record
  const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
    agent.wallet.publicKey,
  );
  const tokenOwnerRecord = tokenOwnerRecords.find(
    (record) =>
      record.realm.equals(realm) &&
      record.governingTokenMint.equals(config.governingTokenMint),
  );

  if (!tokenOwnerRecord) {
    throw new Error("Token owner record not found");
  }

  const voteType: VoteType = {
    choiceType: config.voteType === "single-choice" ? "single" : "multi",
    multiChoiceOptions:
      config.voteType === "multiple-choice"
        ? {
            choiceType: "fullWeight",
            minVoterOptions: 1,
            maxVoterOptions: config.options.length,
            maxWinningOptions: 1,
          }
        : null,
  };

  const createProposalIx = await splGovernance.createProposalInstruction(
    config.name,
    config.description,
    voteType,
    [config.options[0]], // Only support single option for now
    true, // useDenyOption
    realm,
    governance.publicKey,
    tokenOwnerRecord.publicKey,
    config.governingTokenMint,
    agent.wallet.publicKey,
    agent.wallet.publicKey, // payer
  );

  const transaction = new Transaction().add(createProposalIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return new PublicKey(signature);
}

export async function castVoteOnProposal(
  agent: SolanaAgentKit,
  config: VoteConfig,
): Promise<string> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get token owner record
  const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
    config.tokenOwner || agent.wallet.publicKey,
  );
  const tokenOwnerRecord = tokenOwnerRecords.find(
    (record) =>
      record.realm.equals(config.realm) &&
      record.governingTokenMint.equals(config.governingTokenMint),
  );

  if (!tokenOwnerRecord) {
    throw new Error("Token owner record not found");
  }

  const proposal = await splGovernance.getProposalByPubkey(config.proposal);
  if (!proposal) {
    throw new Error("Proposal not found");
  }

  const voteChoice: VoteChoice = { rank: 0, weightPercentage: 100 };
  const vote = {
    kind: "enum",
    variant:
      config.choice === 0
        ? "Approve"
        : config.choice === 1
          ? "Deny"
          : "Abstain",
    fields: config.choice === 0 ? [[voteChoice]] : [],
  } as unknown as Vote;

  const castVoteIx = await splGovernance.castVoteInstruction(
    vote,
    config.realm,
    config.governance,
    config.proposal,
    tokenOwnerRecord.publicKey, // proposalOwnerTokenOwnerRecord
    tokenOwnerRecord.publicKey, // voterTokenOwnerRecord
    agent.wallet.publicKey, // governanceAuthority
    config.governingTokenMint,
    agent.wallet.publicKey, // payer
  );

  const transaction = new Transaction().add(castVoteIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return signature;
}

export async function getRealmInfo(agent: SolanaAgentKit, realmPk: PublicKey) {
  const splGovernance = new SplGovernance(agent.connection);
  const realm = await splGovernance.getRealmByPubkey(realmPk);
  return realm;
}

export async function getTokenOwnerRecord(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
  governingTokenOwner: PublicKey,
) {
  const splGovernance = new SplGovernance(agent.connection);
  const records =
    await splGovernance.getTokenOwnerRecordsForOwner(governingTokenOwner);
  return records.find(
    (record) =>
      record.realm.equals(realm) &&
      record.governingTokenMint.equals(governingTokenMint),
  );
}

export async function getVoterHistory(agent: SolanaAgentKit, voter: PublicKey) {
  const splGovernance = new SplGovernance(agent.connection);
  return await splGovernance.getVoteRecordsForUser(voter);
}
