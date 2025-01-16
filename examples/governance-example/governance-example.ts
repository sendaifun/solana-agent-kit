import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { GovernanceAgent } from '../../src/agents/governanceAgent';

async function main() {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const governanceProgramId = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');
    const governanceAgent = new GovernanceAgent(connection, governanceProgramId);

    // Example: Create a proposal
    const realm = new PublicKey('...'); // Your realm address
    const governance = new PublicKey('...'); // Your governance address
    const tokenOwnerRecord = new PublicKey('...'); // Your token owner record
    const governingTokenMint = new PublicKey('...'); // Your governing token mint
    const proposalSeed = new PublicKey('...'); // Your proposal seed

    // Create instructions (using TransactionInstruction directly)
    const instructions: TransactionInstruction[] = [
        new TransactionInstruction({
            programId: governanceProgramId,  // Use the correct programId
            data: Buffer.from('...'),         // Serialized instruction data
            keys: [
                { pubkey: new PublicKey('...'), isSigner: false, isWritable: true },
                { pubkey: new PublicKey('...'), isSigner: true, isWritable: false }
            ]
        })
    ];

    // Submit the proposal with all required parameters
    await governanceAgent.submitProposal(
        realm,
        governance,
        tokenOwnerRecord,
        'My Proposal',
        'Description of my proposal',
        governingTokenMint,
        proposalSeed,
        instructions // Pass the instructions here
    );

    // Monitor proposal status
    const proposalAddress = new PublicKey('...'); // Your proposal address
    const status = await governanceAgent.monitorProposal(proposalAddress);
    console.log('Proposal status:', status);

    // Execute an approved proposal
    const proposalToExecute = new PublicKey('...'); // Address of approved proposal
    const governanceAccount = new PublicKey('...'); // Governance account address

    const proposalInstructions: TransactionInstruction[] = [
        new TransactionInstruction({
            programId: governanceProgramId,  // Use the correct programId
            data: Buffer.from('...'),         // Serialized instruction data
            keys: [
                { pubkey: new PublicKey('...'), isSigner: false, isWritable: true },
                { pubkey: new PublicKey('...'), isSigner: true, isWritable: false }
            ]
        })
    ];

    const executeIx = await governanceAgent.executeProposal(
        governanceAccount,
        proposalToExecute,
        proposalInstructions // Pass the instructions here
    );
    console.log('Proposal execution instruction created');
}

main().catch(console.error);
