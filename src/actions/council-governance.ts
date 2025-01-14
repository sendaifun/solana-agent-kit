import { PublicKey, Transaction } from "@solana/web3.js";
import { SplGovernance } from "governance-idl-sdk";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../agent";

export interface CouncilConfig {
  minTokensToCreateGovernance: number;
  minVotingThreshold: number;
  minTransactionHoldUpTime: number;
  maxVotingTime: number;
  voteTipping: "strict" | "early" | "disabled";
}

export interface CouncilMemberConfig {
  member: PublicKey;
  tokenAmount: number;
}

export async function configureCouncilSettings(
  agent: SolanaAgentKit,
  realm: PublicKey,
  config: CouncilConfig,
): Promise<string> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get the governance account for the realm
  const governanceAccounts =
    await splGovernance.getGovernanceAccountsByRealm(realm);

  if (!governanceAccounts.length) {
    throw new Error("No governance account found for realm");
  }

  const governance = governanceAccounts[0];

  // Create config instruction
  const configureIx =
    await splGovernance.program.instruction.setGovernanceConfig(
      {
        communityVoteThreshold: { value: new BN(config.minVotingThreshold) },
        minCommunityWeightToCreateProposal: new BN(
          config.minTokensToCreateGovernance,
        ),
        minTransactionHoldUpTime: new BN(config.minTransactionHoldUpTime),
        maxVotingTime: new BN(config.maxVotingTime),
        votingBaseTime: new BN(0),
        votingCoolOffTime: new BN(0),
        depositExemptProposalCount: 0,
        communityVoteTipping: config.voteTipping,
        councilVoteTipping: config.voteTipping,
        minCouncilWeightToCreateProposal: new BN(1),
        councilVoteThreshold: { value: new BN(1) },
        councilVetoVoteThreshold: { value: new BN(0) },
        communityVetoVoteThreshold: { value: new BN(0) },
      },
      {
        accounts: {
          governanceAccount: governance.publicKey,
        },
      },
    );

  const transaction = new Transaction().add(configureIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return signature;
}

export async function addCouncilMember(
  agent: SolanaAgentKit,
  realm: PublicKey,
  councilMint: PublicKey,
  memberConfig: CouncilMemberConfig,
): Promise<string> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get all realm configs
  const allRealmConfigs = await splGovernance.getAllRealmConfigs();
  const realmConfig = allRealmConfigs.find((config: { realm: PublicKey }) =>
    config.realm.equals(realm),
  );
  if (!realmConfig) {
    throw new Error("Realm config not found");
  }

  // Get token owner record
  const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
    memberConfig.member,
  );
  const tokenOwnerRecord = tokenOwnerRecords.find(
    (record) =>
      record.realm.equals(realm) &&
      record.governingTokenMint.equals(councilMint),
  );

  if (!tokenOwnerRecord) {
    throw new Error("Token owner record not found");
  }

  // Create mint tokens instruction for council member
  const mintTokensIx =
    await splGovernance.program.instruction.depositGoverningTokens(
      new BN(memberConfig.tokenAmount),
      {
        accounts: {
          realmAccount: realm,
          realmConfigAccount: realmConfig.publicKey,
          governingTokenHoldingAccount: councilMint,
          governingTokenOwnerAccount: memberConfig.member,
          governingTokenSourceAccount: agent.wallet.publicKey,
          governingTokenSourceAccountAuthority: agent.wallet.publicKey,
          tokenOwnerRecord: tokenOwnerRecord.publicKey,
          payer: agent.wallet.publicKey,
          tokenProgram: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          ),
          systemProgram: new PublicKey("11111111111111111111111111111111"),
        },
      },
    );

  const transaction = new Transaction().add(mintTokensIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return signature;
}

export async function removeCouncilMember(
  agent: SolanaAgentKit,
  realm: PublicKey,
  councilMint: PublicKey,
  member: PublicKey,
): Promise<string> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get all realm configs
  const allRealmConfigs = await splGovernance.getAllRealmConfigs();
  const realmConfigForBurn = allRealmConfigs.find(
    (config: { realm: PublicKey }) => config.realm.equals(realm),
  );
  if (!realmConfigForBurn) {
    throw new Error("Realm config not found");
  }

  // Get token owner record for the member
  const tokenOwnerRecords =
    await splGovernance.getTokenOwnerRecordsForOwner(member);
  const councilRecord = tokenOwnerRecords.find(
    (record) =>
      record.realm.equals(realm) &&
      record.governingTokenMint.equals(councilMint),
  );

  if (!councilRecord) {
    throw new Error("Council member record not found");
  }

  // Create withdraw tokens instruction
  const withdrawTokensIx =
    await splGovernance.program.instruction.withdrawGoverningTokens(
      councilRecord.governingTokenDepositAmount,
      {
        accounts: {
          realmAccount: realm,
          realmConfigAccount: realmConfigForBurn.publicKey,
          governingTokenHoldingAccount: councilMint,
          governingTokenOwnerAccount: member,
          governingTokenDestinationAccount: agent.wallet.publicKey,
          tokenOwnerRecord: councilRecord.publicKey,
          tokenProgram: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          ),
        },
      },
    );

  const transaction = new Transaction().add(withdrawTokensIx);
  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return signature;
}

export async function updateCouncilMemberWeight(
  agent: SolanaAgentKit,
  realm: PublicKey,
  councilMint: PublicKey,
  memberConfig: CouncilMemberConfig,
): Promise<string> {
  const splGovernance = new SplGovernance(agent.connection);

  // Get current token owner record
  const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
    memberConfig.member,
  );

  const councilRecord = tokenOwnerRecords.find(
    (record) =>
      record.realm.equals(realm) &&
      record.governingTokenMint.equals(councilMint),
  );

  if (!councilRecord) {
    throw new Error("Council member record not found");
  }

  const currentAmount = councilRecord.governingTokenDepositAmount;
  const targetAmount = new BN(memberConfig.tokenAmount);

  const transaction = new Transaction();

  if (targetAmount.gt(currentAmount)) {
    // Mint additional tokens
    const mintAmount = targetAmount.sub(currentAmount);

    // Get realm config
    const allRealmConfigs = await splGovernance.getAllRealmConfigs();
    const realmConfig = allRealmConfigs.find((config: { realm: PublicKey }) =>
      config.realm.equals(realm),
    );
    if (!realmConfig) {
      throw new Error("Realm config not found");
    }

    // Get token owner record
    const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
      memberConfig.member,
    );
    const tokenOwnerRecord = tokenOwnerRecords.find(
      (record) =>
        record.realm.equals(realm) &&
        record.governingTokenMint.equals(councilMint),
    );

    if (!tokenOwnerRecord) {
      throw new Error("Token owner record not found");
    }

    // Get realm config account
    const realmConfigPda = splGovernance.pda.realmConfigAccount({
      realmAccount: realm,
    }).publicKey;

    // Get token owner record
    const tokenOwnerRecordPda = splGovernance.pda.tokenOwnerRecordAccount({
      realmAccount: realm,
      governingTokenMintAccount: councilMint,
      governingTokenOwner: memberConfig.member,
    }).publicKey;

    // Create mint tokens instruction
    const mintTokensIx =
      await splGovernance.program.instruction.depositGoverningTokens(
        mintAmount,
        {
          accounts: {
            realmAccount: realm,
            realmConfigAccount: realmConfigPda,
            governingTokenHoldingAccount: councilMint,
            governingTokenOwnerAccount: memberConfig.member,
            governingTokenSourceAccount: agent.wallet.publicKey,
            governingTokenSourceAccountAuthority: agent.wallet.publicKey,
            tokenOwnerRecord: tokenOwnerRecordPda,
            payer: agent.wallet.publicKey,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            ),
            systemProgram: new PublicKey("11111111111111111111111111111111"),
          },
        },
      );
    transaction.add(mintTokensIx);
  } else if (targetAmount.lt(currentAmount)) {
    // Burn excess tokens
    const burnAmount = currentAmount.sub(targetAmount);

    // Get realm config
    const allRealmConfigs = await splGovernance.getAllRealmConfigs();
    const realmConfig = allRealmConfigs.find((config: { realm: PublicKey }) =>
      config.realm.equals(realm),
    );
    if (!realmConfig) {
      throw new Error("Realm config not found");
    }

    // Get token owner record
    const tokenOwnerRecords = await splGovernance.getTokenOwnerRecordsForOwner(
      memberConfig.member,
    );
    const tokenOwnerRecord = tokenOwnerRecords.find(
      (record) =>
        record.realm.equals(realm) &&
        record.governingTokenMint.equals(councilMint),
    );

    if (!tokenOwnerRecord) {
      throw new Error("Token owner record not found");
    }

    const burnTokensIx =
      await splGovernance.program.instruction.withdrawGoverningTokens(
        burnAmount,
        {
          accounts: {
            realmAccount: realm,
            realmConfigAccount: realmConfig.publicKey,
            governingTokenHoldingAccount: councilMint,
            governingTokenOwnerAccount: memberConfig.member,
            governingTokenDestinationAccount: agent.wallet.publicKey,
            tokenOwnerRecord: tokenOwnerRecord.publicKey,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            ),
          },
        },
      );
    transaction.add(burnTokensIx);
  } else {
    throw new Error("No weight change needed");
  }

  const signature = await agent.connection.sendTransaction(transaction, [
    agent.wallet,
  ]);

  return signature;
}
