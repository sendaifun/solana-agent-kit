import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaManageVoteDelegationTool extends Tool {
    name = "delegate_vote";
    description = `Delegate voting power to another wallet. 
    
    Input should be a JSON string containing: 
    
    - realmAccount : string, the address eg "7nxQB..." of the realm (required)
    - governingTokenMint: string, the PublicKey of the governing token mint (required)
    - delegate: string, the PublicKey of the new delegate (required) `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { realm, governingTokenMint, delegate } = JSON.parse(input);

      // Validate public keys
      if (
        !PublicKey.isOnCurve(realm) ||
        !PublicKey.isOnCurve(governingTokenMint) ||
        !PublicKey.isOnCurve(delegate)
      ) {
        throw new Error(
          "Invalid public key provided for realm, governingTokenMint, or delegate",
        );
      }
      const signature = await this.solanaKit.manageVoteDelegation(
        new PublicKey(realm),
        new PublicKey(governingTokenMint),
        new PublicKey(delegate),
      );

      return JSON.stringify({
        status: "success",
        message: "Voting power delegated successfully",
        data: { signature },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}