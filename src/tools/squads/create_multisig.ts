import * as multisig from "@sqds/multisig";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";

/**
 * Creates a new Squads multisig account.
 *
 * @param agent - The SolanaAgentKit instance containing the connection and wallet information.
 * @param creator - The public key of the creator who will be a member of the multisig.
 * @returns A promise that resolves to the transaction ID of the multisig creation transaction.
 *
 * @throws Will throw an error if the transaction fails.
 */
export async function create_squads_multisig(
  agent: SolanaAgentKit,
  creator: PublicKey,
): Promise<string> {
  const connection = agent.connection;
  const createKey = agent.wallet; // can be any keypair, using the agent wallet as only one multisig is required

  const [multisigPda] = multisig.getMultisigPda({
    createKey: createKey.publicKey,
  });

  const programConfigPda = multisig.getProgramConfigPda({})[0];

  const programConfig =
    await multisig.accounts.ProgramConfig.fromAccountAddress(
      connection,
      programConfigPda,
    );

  const configTreasury = programConfig.treasury;
  const tx = multisig.transactions.multisigCreateV2({
    blockhash: (await connection.getLatestBlockhash()).blockhash,
    treasury: configTreasury,
    createKey: createKey.publicKey,
    creator: agent.wallet.publicKey,
    multisigPda,
    configAuthority: null,
    timeLock: 0,
    threshold: 2,
    rentCollector: null,
    members: [
      {
        key: agent.wallet.publicKey,
        permissions: multisig.types.Permissions.all(),
      },
      {
        key: creator,
        permissions: multisig.types.Permissions.all(),
      },
    ],
  });

  tx.sign([agent.wallet, createKey]);

  const txId = connection.sendRawTransaction(tx.serialize());

  return txId;
}
