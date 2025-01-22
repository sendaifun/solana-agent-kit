import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getLastXTransactions } from "../utils/helper";

import { SolanaAgentKit } from "solana-agent-kit";

const initializeSolanaAgent = () => {
  const agent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.SOLANA_RPC_URL!,
    process.env.OPENAI_API_KEY!,
  );
  return agent;
};

interface CommandProps {
  [key: string]: string;
}

export default async function triggerCommand(
  data: CommandProps,
  publicKey: PublicKey,
  connection: Connection,
) {
  if (!publicKey) {
    return {
      message: "Please connect your wallet.",
      status: "error",
    };
  }
  const { action } = data;
  let response;
  switch (action) {
    case "send":
      response = await handleSendCommand(data);
      return response;
    case "buy":
      response = await handleBuyCommand();
      return response;
    case "swap":
      response = await handleSwapCommand();
      return response;
    case "create_token":
      response = await handleCreateTokenCommand(data);
      return response;
    case "check_balance":
      response = await handleCheckBalanceCommand(publicKey);
      return response;
    case "get_address":
      response = await handleGetAddressCommand(publicKey);
      return response;
    case "transaction_status":
      response = await handleTransactionStatusCommand(publicKey, connection);
      return response;
    case "recent_transaction":
      response = await handleRecentTransactionCommand(publicKey, connection);
      return response;
    default:
      response = {
        message: data.message,
        status: "error",
      };
      return response;
  }
}

const handleSendCommand = async (data: CommandProps) => {
  const { amount, toPublicKey } = data;
  if (!amount || !toPublicKey) {
    return {
      message: "Please provide the amount and recipient address.",
      status: "error",
    };
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return {
      message: "Invalid amount. Please provide a valid amount.",
      status: "error",
    };
  }
  try {
    const agent = initializeSolanaAgent();
    console.log("agent", agent);
    const signature = await agent.transfer(
      new PublicKey(toPublicKey),
      parsedAmount,
    );
    if (signature) {
      return {
        message:
          "Sent " +
          amount +
          "SOL to " +
          toPublicKey +
          "\n\n" +
          "check on [Explorer](https://solscan.io/tx/" +
          signature +
          "?cluster=devnet)",
        status: "success",
      };
    }
  } catch (error) {
    return {
      message: "Failed to send transaction.",
      status: "error",
    };
  }
};

const handleBuyCommand = async () => {
  return {
    message:
      "**Buy Command isn't implemented yet. ☹️**" +
      "\n\n" +
      "BUT BUT BUT" +
      "\n\n" +
      "You can buy from below listed exchanges." +
      "\n\n" +
      "[Binance](https://www.binance.com)" +
      "\n\n" +
      "[Coinbase](https://www.coinbase.com)" +
      "\n\n" +
      "etc...",
    status: "error",
  };
};

const handleSwapCommand = async () => {
  return {
    message:
      "**Swap Command isn't implemented yet. ☹️**" +
      "\n\n" +
      "BUT BUT BUT" +
      "\n\n" +
      "You can swap from below listed exchanges." +
      "\n\n" +
      "[Uniswap](https://app.uniswap.org/)" +
      "\n\n" +
      "[Raydium](https://raydium.io/)" +
      "\n\n" +
      "[Jupiter](https://jup.ag/)" +
      "\n\n" +
      "etc...",
    status: "error",
  };
};

const handleCreateTokenCommand = async (data: CommandProps) => {
  const { tokenName, tokenSymbol, tokenDecimals, uri, mintAmount } = data;
  if (!tokenName || !tokenSymbol || !tokenDecimals || !uri || !mintAmount) {
    return {
      message:
        "Please provide all the required details for token creation" +
        "\n" +
        "tokenName: " +
        tokenName +
        "\n" +
        "tokenSymbol: " +
        tokenSymbol +
        "\n" +
        "tokenDecimals: " +
        tokenDecimals +
        "\n" +
        "uri: " +
        uri +
        "\n" +
        "mintAmount: " +
        mintAmount,
      status: "error",
    };
  }
  try {
    const agent = initializeSolanaAgent();
    const mintPublicKey = await agent.deployToken(
      tokenName,
      uri,
      tokenSymbol,
      parseInt(tokenDecimals),
      parseInt(mintAmount),
    );
    return {
      message:
        "**Token created successfully.** \
        Check on [Link](https://solscan.io/address/" +
        mintPublicKey.toString() +
        "?cluster=devnet)" +
        "\n\n" +
        "**Total Supply:** " +
        mintAmount +
        "\n\n" +
        "**Token Name:** " +
        tokenName +
        "\n\n" +
        "**Token Symbol:** " +
        tokenSymbol +
        "\n\n" +
        "**Token Decimals:** " +
        tokenDecimals,
      status: "success",
    };
  } catch (error) {
    return {
      message: "Failed to create token.",
      status: "error",
    };
  }
};
const handleCheckBalanceCommand = async (publicKey: PublicKey) => {
  if (!publicKey) {
    return {
      message: "Please connect your wallet.",
      status: "error",
    };
  }
  const agent = initializeSolanaAgent();
  const balance = await agent.getBalance(publicKey);
  return {
    message: `Your balance is ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL.`,
    status: "success",
  };
};
const handleGetAddressCommand = async (publicKey: PublicKey) => {
  if (!publicKey) {
    return {
      message: "Please connect your wallet.",
      status: "error",
    };
  }
  return {
    message: `Your address is ${publicKey.toString()}.`,
    status: "success",
  };
};
const handleTransactionStatusCommand = async (
  publicKey: PublicKey,
  connection: Connection,
) => {
  if (!publicKey) {
    return {
      message: "Please connect your wallet.",
      status: "error",
    };
  }
  const transactions = await getLastXTransactions(
    publicKey.toString(),
    connection,
    1,
  );
  return {
    message: `Your last transaction's status is: ${transactions[0].confirmationStatus}`,
    status: "success",
  };
};
const handleRecentTransactionCommand = async (
  publicKey: PublicKey,
  connection: Connection,
) => {
  if (!publicKey) {
    return {
      message: "Please connect your wallet.",
      status: "error",
    };
  }
  const transactions = await getLastXTransactions(
    publicKey.toString(),
    connection,
    5,
  );
  return {
    message:
      "Your last 5 transactions's status are: " +
      " \n " +
      transactions
        .map(
          (transaction) =>
            "| [" +
            transaction.confirmationStatus +
            "](https://solscan.io/tx/" +
            transaction.signature +
            "?cluster=devnet) |",
        )
        .join("\n"),
    status: "success",
  };
};
