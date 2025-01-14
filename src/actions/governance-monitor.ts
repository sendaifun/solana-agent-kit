import { Connection, PublicKey } from "@solana/web3.js";
import { SplGovernance } from "governance-idl-sdk";
import type { TokenOwnerRecord } from "governance-idl-sdk";
import { SolanaAgentKit } from "../agent";

export type MembershipChangeCallback = (
  tokenOwnerRecord: TokenOwnerRecord,
  isNew: boolean,
) => void;

export type VotingPowerChangeCallback = (
  owner: PublicKey,
  oldBalance: number,
  newBalance: number,
) => void;

export class GovernanceMonitor {
  private membershipSubscriptionId?: number | undefined;
  private votingPowerSubscriptionId?: number | undefined;
  private lastKnownBalances: Map<string, number> = new Map();
  private splGovernance: SplGovernance;

  constructor(
    private agent: SolanaAgentKit,
    private realm: PublicKey,
    private governingTokenMint: PublicKey,
  ) {
    this.splGovernance = new SplGovernance(agent.connection);
  }

  async monitorMembershipChanges(
    callback: MembershipChangeCallback,
  ): Promise<void> {
    this.membershipSubscriptionId =
      this.agent.connection.onProgramAccountChange(
        new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"),
        async (accountInfo) => {
          try {
            const records =
              await this.splGovernance.getTokenOwnerRecordsForOwner(
                new PublicKey(accountInfo.accountInfo.owner),
              );

            const tokenOwnerRecord = records.find(
              (record) =>
                record.realm.equals(this.realm) &&
                record.governingTokenMint.equals(this.governingTokenMint),
            );

            if (tokenOwnerRecord) {
              const isNew =
                accountInfo.accountInfo.lamports > 0 &&
                accountInfo.accountInfo.data.length === 0;
              callback(tokenOwnerRecord, isNew);
            }
          } catch (error) {
            console.error("Error processing membership change:", error);
          }
        },
      );
  }

  async monitorVotingPowerChanges(
    callback: VotingPowerChangeCallback,
  ): Promise<void> {
    this.votingPowerSubscriptionId =
      this.agent.connection.onProgramAccountChange(
        this.governingTokenMint,
        async (accountInfo) => {
          try {
            const owner = new PublicKey(accountInfo.accountInfo.owner);
            const tokenBalance = accountInfo.accountInfo.lamports;
            const oldBalance =
              this.lastKnownBalances.get(owner.toBase58()) || 0;

            if (tokenBalance !== oldBalance) {
              callback(owner, oldBalance, tokenBalance);
              this.lastKnownBalances.set(owner.toBase58(), tokenBalance);
            }
          } catch (error) {
            console.error("Error processing voting power change:", error);
          }
        },
      );
  }

  async stopMonitoring(): Promise<void> {
    if (this.membershipSubscriptionId !== undefined) {
      await this.agent.connection.removeAccountChangeListener(
        this.membershipSubscriptionId,
      );
      this.membershipSubscriptionId = undefined;
    }

    if (this.votingPowerSubscriptionId !== undefined) {
      await this.agent.connection.removeAccountChangeListener(
        this.votingPowerSubscriptionId,
      );
      this.votingPowerSubscriptionId = undefined;
    }
  }
}
