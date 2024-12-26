import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Uses the Blink service to perform a transaction with the Solana blockchain.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {(string | number)[]} inputs - An array of inputs to be used in the URL template.
 * @param {string} [blinkGetURL] - The URL to fetch the Blink POST URL if not provided.
 * @param {string} [blinkPostURL] - The URL to post the transaction data.
 * @returns {Promise<string>} - A promise that resolves to the transaction signature.
 * @throws {Error} - Throws an error if Blink URLs are not provided or if the transaction fails.
 */
export async function useBlink(
  agent: SolanaAgentKit,
  inputs: (string | number)[],
  blinkGetURL?: string,
  blinkPostURL?: string,
): Promise<string> {
  try {
    if (!blinkGetURL && !blinkPostURL) {
      throw new Error("Blink URLs are required");
    }
    if (blinkGetURL && !blinkPostURL) {
      // fetch blinkPostURL from blinkGetURL
      const response = await fetch(blinkGetURL);
      const data = await response.json();
      const postURL = data.links.actions[0].href;
      blinkPostURL = postURL;
    }

    const parsedUrl = parseUrlTemplate(`${blinkPostURL}`, inputs);
    // resolve blinkPostURL
    const response = await fetch(`${parsedUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account: agent.wallet.publicKey.toBase58(),
      }),
    });

    const data = await response.json();

    // Deserialize the transaction
    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Get a recent blockhash and set it
    const { blockhash } = await agent.connection.getLatestBlockhash();
    luloTxn.message.recentBlockhash = blockhash;

    // Sign and send transaction
    luloTxn.sign([agent.wallet]);

    const signature = await agent.connection.sendTransaction(luloTxn, {
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    // Wait for confirmation using the latest strategy
    const latestBlockhash = await agent.connection.getLatestBlockhash();
    await agent.connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}

/**
 * Parses a URL template and replaces curly bracket placeholders with values from an array
 * @param urlTemplate - URL template containing placeholders in curly brackets
 * @param values - Array of values to replace the placeholders
 * @returns Parsed URL with replaced values
 * @throws Error if number of values doesn't match number of placeholders
 */
function parseUrlTemplate(
  urlTemplate: string,
  values: (string | number)[],
): string {
  // Find all placeholder matches using regex
  const placeholders = urlTemplate.match(/\{([^}]+)\}/g);

  // If no placeholders found, return original URL
  if (!placeholders) {
    return urlTemplate;
  }

  // Validate if number of values matches number of placeholders
  if (placeholders.length !== values.length) {
    throw new Error(
      `Mismatch between number of placeholders (${placeholders.length}) and values (${values.length})`,
    );
  }

  // Replace each placeholder with corresponding value
  let parsedUrl = urlTemplate;
  placeholders.forEach((placeholder, index) => {
    parsedUrl = parsedUrl.replace(placeholder, String(values[index]));
  });

  return parsedUrl;
}
