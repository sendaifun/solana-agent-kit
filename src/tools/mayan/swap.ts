import {
  addresses,
  ChainName,
  Erc20Permit,
  fetchQuote,
  fetchTokenList,
  Quote,
  swapFromEvm,
  swapFromSolana,
} from "@mayanfinance/swap-sdk";
import { SolanaAgentKit } from "../../agent";
import {
  Contract,
  getDefaultProvider,
  parseUnits,
  Signature,
  Signer,
  TransactionResponse,
  TypedDataEncoder,
  Wallet,
} from "ethers";
import { abi as ERC20Permit_ABI } from "@openzeppelin/contracts/build/contracts/ERC20Permit.json";
import { VersionedTransaction, Transaction } from "@solana/web3.js";
import MayanForwarderArtifact from "./MayanForwarderArtifact";

async function findTokenContract(
  symbol: string,
  chain: string,
): Promise<string> {
  const tokens = await fetchTokenList(chain as ChainName, true);
  const token = tokens.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
  );
  if (!token) {
    throw new Error(`Couldn't find token with ${symbol} symbol`);
  }

  return token.contract;
}

export async function swap(
  agent: SolanaAgentKit,
  amount: string,
  fromChain: string,
  fromToken: string,
  toChain: string,
  toToken: string,
  dstAddr: string,
  slippageBps: "auto" | number = "auto",
): Promise<string> {
  if (fromToken.length < 32) {
    fromToken = await findTokenContract(fromToken, fromChain);
  }
  if (toToken.length < 32) {
    toToken = await findTokenContract(toToken, toChain);
  }

  const quotes = await fetchQuote({
    amount: +amount,
    fromChain: fromChain as ChainName,
    toChain: toChain as ChainName,
    fromToken,
    toToken,
    slippageBps,
  });
  if (quotes.length === 0) {
    throw new Error(
      "There is no quote available for the tokens you requested.",
    );
  }

  let txHash;
  if (fromChain === "solana") {
    txHash = await swapSolana(quotes[0], agent, dstAddr);
  } else {
    txHash = await swapEVM(quotes[0], agent, dstAddr);
  }

  return `https://explorer.mayan.finance/swap/${txHash}`;
}

async function swapSolana(
  quote: Quote,
  agent: SolanaAgentKit,
  dstAddr: string,
): Promise<string> {
  const jitoConfig = await getJitoConfig();
  const jitoTipLamports = await getJitoTipLamports();
  const jitoTip = jitoConfig?.enable
    ? Math.min(
        jitoTipLamports || jitoConfig?.defaultTipLamports,
        jitoConfig?.maxTipLamports,
      )
    : 0;

  const jitoOptions = {
    tipLamports: jitoTip,
    jitoAccount: jitoConfig.jitoAccount,
    jitoSendUrl: jitoConfig.sendBundleUrl,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(
      trxs: T[],
    ): Promise<T[]> => {
      for (let i = 0; i < trxs.length; i++) {
        if ("version" in trxs[i]) {
          (trxs[i] as VersionedTransaction).sign([agent.wallet]);
        } else {
          (trxs[i] as Transaction).partialSign(agent.wallet);
        }
      }
      return trxs;
    },
  };

  const signer = async <T extends Transaction | VersionedTransaction>(
    trx: T,
  ): Promise<T> => {
    if ("version" in trx) {
      (trx as VersionedTransaction).sign([agent.wallet]);
    } else {
      (trx as Transaction).partialSign(agent.wallet);
    }
    return trx;
  };

  const swapRes = await swapFromSolana(
    quote,
    agent.wallet.publicKey.toString(),
    dstAddr,
    null,
    signer,
    agent.connection,
    [],
    { skipPreflight: true },
    jitoOptions,
  );
  if (!swapRes.signature) {
    throw new Error("Error on swap from solana. Try again.");
  }

  try {
    const { blockhash, lastValidBlockHeight } =
      await agent.connection.getLatestBlockhash();
    const result = await agent.connection.confirmTransaction(
      {
        signature: swapRes.signature,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      },
      "confirmed",
    );
    if (result?.value.err) {
      throw new Error(`Transaction ${swapRes.serializedTrx} reverted!`);
    }
    return swapRes.signature;
  } catch (error) {
    // Wait for 3 sec and check mayan explorer
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const res = await fetch(
      `https://explorer-api.mayan.finance/v3/swap/trx/${swapRes.signature}`,
    );
    if (res.status !== 200) {
      throw error;
    }
    return swapRes.signature;
  }
}

let evmWallet: Wallet | null;

async function swapEVM(
  quote: Quote,
  agent: SolanaAgentKit,
  dstAddr: string,
): Promise<string> {
  if (!evmWallet) {
    if (agent.config.ETHEREUM_PRIVATE_KEY) {
      evmWallet = new Wallet(agent.config.ETHEREUM_PRIVATE_KEY);
    } else {
      throw new Error("You haven't provided EVM wallet private key.");
    }
  }
  const signer = evmWallet.connect(getDefaultProvider(quote.fromToken.chainId));

  const amountIn = getAmountOfFractionalAmount(
    quote.effectiveAmountIn,
    quote.fromToken.decimals,
  );
  const tokenContract = new Contract(
    quote.fromToken.contract,
    ERC20Permit_ABI,
    signer,
  );

  const allowance: bigint = await tokenContract.allowance(
    evmWallet.address,
    addresses.MAYAN_FORWARDER_CONTRACT,
  );
  if (allowance < amountIn) {
    // Approve the spender to spend the tokens
    const approveTx = await tokenContract.approve(
      addresses.MAYAN_FORWARDER_CONTRACT,
      amountIn,
    );
    await approveTx.wait();
  }

  let permit: Erc20Permit | undefined;
  if (quote.fromToken.supportsPermit) {
    permit = await getERC20Permit(quote, tokenContract, amountIn, signer);
  }

  const swapRes = await swapFromEvm(
    quote,
    evmWallet.address,
    dstAddr,
    null,
    signer,
    permit,
    null,
    null,
  );
  if (typeof swapRes === "string") {
    return swapRes;
  }
  return (swapRes as TransactionResponse).hash;
}

type SolanaJitoConfig = {
  enable: boolean;
  defaultTipLamports: number;
  maxTipLamports: number;
  sendBundleUrl: string;
  jitoAccount: string;
};

type SiaResponse = Readonly<{
  solanaJitoConfig: SolanaJitoConfig;
}>;

async function getJitoConfig(): Promise<SolanaJitoConfig> {
  const res = await fetch(`https://sia.mayan.finance/v4/init`);
  const data: SiaResponse = await res.json();
  return data.solanaJitoConfig;
}

async function getJitoTipLamports() {
  const res = await fetch(`https://price-api.mayan.finance/jito-tips/suggest`);
  const data = await res.json();
  const tip =
    typeof data?.default === "number" && Number.isFinite(data.default)
      ? data?.default?.toFixed(9)
      : null;
  return tip ? Math.floor(Number(tip) * 10 ** 9) : null;
}

function getAmountOfFractionalAmount(
  amount: string | number,
  decimals: string | number,
): bigint {
  const cutFactor = Math.min(8, Number(decimals));
  const numStr = Number(amount).toFixed(cutFactor + 1);
  const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${cutFactor}})?`);
  const matchResult = numStr.match(reg);
  if (!matchResult) {
    throw new Error("getAmountOfFractionalAmount: fixedAmount is null");
  }
  const fixedAmount = matchResult[0];
  return parseUnits(fixedAmount, Number(decimals));
}

async function getERC20Permit(
  quote: Quote,
  tokenContract: Contract,
  amountIn: bigint,
  signer: Signer,
): Promise<Erc20Permit> {
  const walletSrcAddr = await signer.getAddress();
  const nonce = await tokenContract.nonces(walletSrcAddr);
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const domain = {
    name: await tokenContract.name(),
    version: "1",
    chainId: quote.fromToken.chainId,
    verifyingContract: await tokenContract.getAddress(),
  };
  const domainSeparator = await tokenContract.DOMAIN_SEPARATOR();
  for (let i = 1; i < 11; i++) {
    domain.version = String(i);
    const hash = TypedDataEncoder.hashDomain(domain);
    if (hash.toLowerCase() === domainSeparator.toLowerCase()) {
      break;
    }
  }

  let spender = addresses.MAYAN_FORWARDER_CONTRACT;
  if (quote.type === "SWIFT" && quote.gasless) {
    const forwarderContract = new Contract(
      addresses.MAYAN_FORWARDER_CONTRACT,
      MayanForwarderArtifact.abi,
      signer.provider,
    );
    const isValidSwiftContract = await forwarderContract.mayanProtocols(
      quote.swiftMayanContract,
    );
    if (!isValidSwiftContract) {
      throw new Error("Invalid Swift contract for gasless swap");
    }
    if (!quote.swiftMayanContract) {
      throw new Error("Swift contract not found");
    }
    spender = quote.swiftMayanContract;
  }

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    owner: walletSrcAddr,
    spender,
    value: amountIn,
    nonce: nonce,
    deadline: deadline,
  };

  const signature = await signer.signTypedData(domain, types, value);
  const { v, r, s } = Signature.from(signature);

  const permitTx = await tokenContract.permit(
    walletSrcAddr,
    spender,
    amountIn,
    deadline,
    v,
    r,
    s,
  );
  await permitTx.wait();
  return {
    value: amountIn,
    deadline,
    v,
    r,
    s,
  };
}
