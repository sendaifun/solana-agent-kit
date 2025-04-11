import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaWalletUnifiedTool extends Tool {
  name = "solana_wallet_unified";
  description = `Unified tool for common Solana wallet operations including checking balances, transferring tokens, and managing accounts.
  
  Inputs (input is a JSON string with "action" field determining the operation):
  
  1. For checking account balance:
  action: "balance" (required)
  address: string, wallet address (optional, if not provided uses agent's wallet)
  
  2. For transferring SOL or tokens:
  action: "transfer" (required)
  to: string, recipient address (required)
  amount: number, amount to transfer (required)
  tokenAddress: string, token mint address (optional, if not provided transfers SOL)
  
  3. For closing empty token accounts:
  action: "close_empty_accounts" (required)
  
  4. For requesting test funds:
  action: "request_funds" (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      
      if (!parsedInput.action) {
        throw new Error("action is required");
      }

      switch (parsedInput.action) {
        case "balance":
          return await this.getBalance(parsedInput.address);
        
        case "transfer":
          return await this.transfer(parsedInput.to, parsedInput.amount, parsedInput.tokenAddress);
        
        case "close_empty_accounts":
          return await this.closeEmptyAccounts();
        
        case "request_funds":
          return await this.requestFunds();
        
        default:
          throw new Error(`Unknown action: ${parsedInput.action}`);
      }
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }

  private async getBalance(address?: string): Promise<string> {
    try {
      const walletAddress = address 
        ? new PublicKey(address) 
        : this.solanaKit.wallet_address;
      
      const balance = await this.solanaKit.connection.getBalance(walletAddress);
      const solBalance = balance / 1000000000; // Convert lamports to SOL

      if (address) {
        const balances = await this.solanaKit.getTokenBalances(walletAddress);
        
        return JSON.stringify({
          status: "success",
          message: "Balance retrieved successfully",
          sol: solBalance,
          tokens: balances.tokens,
          address: walletAddress.toString()
        });
      } else {
        const balances = await this.solanaKit.getTokenBalances();
        
        return JSON.stringify({
          status: "success",
          message: "Balance retrieved successfully",
          sol: solBalance,
          tokens: balances.tokens,
          address: this.solanaKit.wallet_address.toString()
        });
      }
    } catch (error: any) {
      throw new Error(`Error getting balance: ${error.message}`);
    }
  }

  private async transfer(to: string, amount: number, tokenAddress?: string): Promise<string> {
    try {
      if (!to) {
        throw new Error("Recipient address is required");
      }
      
      if (!amount || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const recipientPubkey = new PublicKey(to);
      
      let txSignature: string;
      
      if (tokenAddress) {
        // Transfer SPL token
        const tokenMint = new PublicKey(tokenAddress);
        txSignature = await this.solanaKit.transfer(recipientPubkey, amount, tokenMint);
      } else {
        // Transfer SOL
        txSignature = await this.solanaKit.transfer(recipientPubkey, amount);
      }

      return JSON.stringify({
        status: "success",
        message: `Transfer successful`,
        transaction: txSignature,
        amount: amount,
        recipient: to,
        token: tokenAddress || "SOL"
      });
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  private async closeEmptyAccounts(): Promise<string> {
    try {
      const result = await this.solanaKit.closeEmptyTokenAccounts();
      
      return JSON.stringify({
        status: "success",
        message: "Empty token accounts closed successfully",
        transaction: result.signature,
        closedCount: result.size
      });
    } catch (error: any) {
      throw new Error(`Failed to close empty accounts: ${error.message}`);
    }
  }

  private async requestFunds(): Promise<string> {
    try {
      // Use devnet airdrop if supported, or notify about mainnet
      let transaction: string;
      try {
        transaction = await this.solanaKit.connection.requestAirdrop(
          this.solanaKit.wallet_address, 
          1000000000 // 1 SOL in lamports
        );
      } catch (e) {
        return JSON.stringify({
          status: "warning",
          message: "Airdrop only available on devnet/testnet. Please use a faucet for mainnet.",
          wallet: this.solanaKit.wallet_address.toString()
        });
      }
      
      return JSON.stringify({
        status: "success",
        message: "Funds requested successfully",
        transaction: transaction,
        wallet: this.solanaKit.wallet_address.toString()
      });
    } catch (error: any) {
      throw new Error(`Failed to request funds: ${error.message}`);
    }
  }
} 