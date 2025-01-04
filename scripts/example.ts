import { ethers } from "hardhat";
import { WalletManager } from "../src/services/WalletManager";
import { AgentWallet } from "../src/services/AgentWallet";

async function main() {
    // Deploy the contract
    const IdentityLinkedWallet = await ethers.getContractFactory("IdentityLinkedWallet");
    const wallet = await IdentityLinkedWallet.deploy();
    await wallet.deployed();
    console.log("IdentityLinkedWallet deployed to:", wallet.address);

    // Initialize WalletManager
    const provider = ethers.provider;
    const walletManager = new WalletManager(provider);

    // Create an agent wallet
    const agentWallet = new AgentWallet(walletManager, "agent1");

    // Link an identity
    const userAddress = "0x..."; // User's address
    const identityField = "user123"; // User's identity field
    await walletManager.linkIdentity(userAddress, identityField);

    // Derive a sub-account
    const identityHash = await walletManager.createIdentityHash(userAddress, identityField);
    const subAccountPath = await agentWallet.deriveSubAccount(identityHash);
    console.log("Sub-account path:", subAccountPath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 