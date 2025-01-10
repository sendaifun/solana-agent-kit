import { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";

export async function rock_paper_scissor(
  agent: SolanaAgentKit,
  amount: number,
  choice: "rock" | "paper" | "scissors",
) {
  try {
    const res = await fetch(
      `https://rps.sendarcade.fun/api/actions/bot?amount=${amount}&choice=${choice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data = await res.json();
    if (data.transaction) {
      const txn = Transaction.from(Buffer.from(data.transaction, "base64"));
      txn.sign(agent.wallet);
      txn.recentBlockhash = (
        await agent.connection.getLatestBlockhash()
      ).blockhash;
      const sig = await sendAndConfirmTransaction(
        agent.connection,
        txn,
        [agent.wallet],
        { commitment: "confirmed" },
      );
      const href = data.links?.next?.href;
      return await outcome(agent, sig, href);
    } else {
      return "failed";
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS game failed: ${error.message}`);
  }
}
async function outcome(
  agent: SolanaAgentKit,
  sig: string,
  href: string,
): Promise<string> {
  try {
    const res = await fetch(
      "https://rps.sendarcade.fun" + href, // href = /api/actions/outcome?id=...
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
          signature: sig,
        }),
      },
    );

    const data: any = await res.json();
    const title = data.title;
    if (title.startsWith("You lost")) {
      return title;
    }
    const next_href = data.links?.actions?.[0]?.href;
    return title + "\n" + (await won(agent, next_href));
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS outcome failed: ${error.message}`);
  }
}
async function won(agent: SolanaAgentKit, href: string): Promise<string> {
  try {
    const res = await fetch(
      "https://rps.sendarcade.fun" + href, // href = /api/actions/won?id=...
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data: any = await res.json();
    if (data.transaction) {
      const txn = Transaction.from(Buffer.from(data.transaction, "base64"));
      txn.partialSign(agent.wallet);
      await agent.connection.sendRawTransaction(txn.serialize(), {
        preflightCommitment: "confirmed",
      });
    } else {
      return "Failed to claim prize.";
    }
    const next_href = data.links?.next?.href;
    return await postWin(agent, next_href);
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS outcome failed: ${error.message}`);
  }
}
async function postWin(agent: SolanaAgentKit, href: string): Promise<string> {
  try {
    const res = await fetch(
      "https://rps.sendarcade.fun" + href, // href = /api/actions/postwin?id=...
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data: any = await res.json();
    const title = data.title;
    return "Prize claimed Successfully" + "\n" + title;
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS outcome failed: ${error.message}`);
  }
}
