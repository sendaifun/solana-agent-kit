const FnBalance = `Get the balance of a Solana wallet or token account.
  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in SOL.`;

const FnTransaction = `Transfer tokens or SOL to another address ( also called as wallet address ).
  if mint is not given use my address`;

const FnDeployToken = `Deploy a new token on Solana blockchain.
  Inputs (input is a JSON string):
  name: string, eg "My Token" (required)
  uri: string, eg "https://example.com/token.json" (required)
  symbol: string, eg "MTK" (required)
  decimals?: number, eg 9 (optional, defaults to 9)
  initialSupply?: number, eg 1000000 (optional)`;

const FnDeployCollection = `Deploy a new NFT collection on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Collection" (required)
  uri: string, eg "https://example.com/collection.json" (required)
  royaltyBasisPoints?: number, eg 500 for 5% (optional)`;

const FnMintNFT = (recipientAddress: string) =>
  `Mint a new NFT in a collection on Solana blockchain.
    Inputs (input is a JSON string):
    collectionMint: string, eg "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w" (required) - The address of the collection to mint into
    name: string, eg "My NFT" (required)
    uri: string, eg "https://example.com/nft.json" (required)
    recipient?: string, eg "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u" (optional) - The wallet to receive the NFT, defaults to agent's wallet which is ${recipientAddress}`;

const FnTrade = `This tool can be used to swap tokens to another token ( It uses Jupiter Exchange ).
  Inputs ( input is a JSON string ):
  outputMint: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (required)
  inputAmount: number, eg 1 or 0.01 (required)
  inputMint?: string, eg "So11111111111111111111111111111111111111112" (optional)
  slippageBps?: number, eg 100 (optional)`;

const FnRequestFunds = "Request SOL from Solana faucet (devnet/testnet only)";

const FnRegisterDomain = `Register a .sol domain name for your wallet.
  Inputs:
  name: string, eg "pumpfun.sol" (required)
  spaceKB: number, eg 1 (optional, default is 1)`;

const FnResolveDomain = `Resolve ONLY .sol domain names to a Solana PublicKey.
  This tool is exclusively for .sol domains.
  DO NOT use this for other domain types like .blink, .bonk, etc.

  Inputs:
  domain: string, eg "pumpfun.sol" (required)
  `;

const FnGetDomainList = `Retrieve the .sol domain associated for a given account address.

  Inputs:
  account: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)
  `;

const FnGetWalletAddress = `Get the wallet address of the agent`;

const FnPumpFunTokenLaunch = `This tool can be used to launch a token on Pump.fun,
   do not use this tool for any other purpose, or for creating SPL tokens.
   If the user asks you to chose the parameters, you should generate valid values.
   For generating the image, you can use the solana_create_image tool.

   Inputs:
   tokenName: string, eg "PumpFun Token",
   tokenTicker: string, eg "PUMP",
   description: string, eg "PumpFun Token is a token on the Solana blockchain",
   imageUrl: string, eg "https://i.imgur.com/UFm07Np_d.png`;

const FnCreateImageTool =
  "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.";

const FnLendAssetTool = `Lend idle USDC for yield using Lulo. ( only USDC is supported )
  Inputs (input is a json string):
  amount: number, eg 1, 0.01 (required)`;

const FnTPSCalculatorTool = "Get the current TPS of the Solana network";

const FnStakeTool = `This tool can be used to stake your SOL (Solana), also called as SOL staking or liquid staking.
  Inputs ( input is a JSON string ):
  amount: number, eg 1 or 0.01 (required)`;

const FnTokenData = `Get the token data for a given token mint address
  Inputs: mintAddress is required.
  mintAddress: string, eg "So11111111111111111111111111111111111111112" (required)`;

const FnFetchPrice = `Fetch the price of a given token in USDC.

  Inputs:
  - tokenId: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"`;

const FnTokenDataByTicker = `Get the token data for a given token ticker
  Inputs: ticker is required.
  ticker: string, eg "USDC" (required)`;

const FnCompressedAirdrop = `Airdrop SPL tokens with ZK Compression (also called as airdropping tokens)
  Inputs (input is a JSON string):
  mintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, the amount of tokens to airdrop per recipient, e.g., 42 (required)
  decimals: number, the decimals of the token, e.g., 6 (required)
  recipients: string[], the recipient addresses, e.g., ["1nc1nerator11111111111111111111111111111111"] (required)
  priorityFeeInLamports: number, the priority fee in lamports. Default is 30_000. (optional)
  shouldLog: boolean, whether to log progress to stdout. Default is false. (optional)`;

const FnCreateSingleSidedWhirlpool = `Create a single-sided Whirlpool with liquidity.
  Inputs (input is a JSON string):
  - depositTokenAmount: number, eg: 1000000000 (required, in units of deposit token including decimals)
  - depositTokenMint: string, eg: "DepositTokenMintAddress" (required, mint address of deposit token)
  - otherTokenMint: string, eg: "OtherTokenMintAddress" (required, mint address of other token)
  - initialPrice: number, eg: 0.001 (required, initial price of deposit token in terms of other token)
  - maxPrice: number, eg: 5.0 (required, maximum price at which liquidity is added)
  - feeTier: number, eg: 0.30 (required, fee tier for the pool)`;

const FnRaydiumCreateAmmV4 = `Raydium's Legacy AMM that requiers an OpenBook marketID
  Inputs (input is a json string):
  marketId: string (required)
  baseAmount: number(int), eg: 111111 (required)
  quoteAmount: number(int), eg: 111111 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;

const FnRaydiumCreateClmm = `Raydium's newest CPMM, does not require marketID, supports Token 2022 standard
  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required), stores pool info, id, index, protocolFeeRate, tradeFeeRate, tickSpacing, fundFeeRate
  initialPrice: number, eg: 123.12 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;

const FnRaydiumCreateCpmm = `Raydium's newest CPMM, does not require marketID, supports Token 2022 standard
  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required), stores pool info, index, protocolFeeRate, tradeFeeRate, fundFeeRate, createPoolFee
  mintAAmount: number(int), eg: 1111 (required)
  mintBAmount: number(int), eg: 2222 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;

const FnOpenbookCreateMarket = `Openbook marketId, required for ammv4
  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)
  `;

const FnPythFetchPrice = `Fetch the price of a given price feed from Pyth's Hermes service
  Inputs:
  priceFeedID: string, the price feed ID, e.g., "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" for BTC/USD`;

const FnResolveAllDomains = `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
  Use this for domains like .blink, .bonk, etc.
  DO NOT use this for .sol domains (use solana_resolve_domain instead).

  Input:
  domain: string, eg "mydomain.blink" or "mydomain.bonk" (required)`;

const FnGetOwnedDomains = `Get all domains owned by a specific wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

const FnGetOwnedTldDomains = `Get all domains owned by the agent's wallet for a specific TLD.

  Inputs:
  tld: string, eg "bonk" (required)`;

const FnGetAllTlds = `Get all active top-level domains (TLDs) in the AllDomains Name Service`;

const FnGetMainDomain = `Get the main/favorite domain for a given wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

const FnCreateGibworkTask = `Create a task on Gibwork.
  Inputs (input is a JSON string):
  title: string, title of the task (required)
  content: string, description of the task (required)
  requirements: string, requirements to complete the task (required)
  tags: string[], list of tags associated with the task (required)
  payer: string, payer address (optional, defaults to agent wallet address)
  tokenMintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, payment amount (required)`;

const FnRope = `Create a TipLink for transferring SOL or SPL tokens.
  Inputs (input is a JSON string):
  amount: number, the amount of tokens to transfer (required)
  splmintAddress: string, the mint address of the SPL token (optional)`;

const FnTipLink = `Create a TipLink for transferring SOL or SPL tokens.
  Inputs (input is a JSON string):
  amount: number, the amount of tokens to transfer (required)
  splmintAddress: string, the mint address of the SPL token (optional)`;

const FnRockPaperScissors = `Play Rock-Paper-Scissors game with the agent.
  Inputs (input is a JSON string):
  choice: string, either "rock", "paper", or "scissors" (required)
  amount: number, amount of SOL to play with - must be 0.1, 0.01, or 0.005 SOL (required)`;

const FnCreateTiplink = `Create a TipLink for transferring SOL or SPL tokens.
  Inputs (input is a JSON string):
  amount: number, the amount of tokens to transfer (required)
  splmintAddress: string, the mint address of the SPL token (optional)`;

export {
  FnBalance,
  FnTransaction,
  FnDeployToken,
  FnDeployCollection,
  FnMintNFT,
  FnTrade,
  FnRequestFunds,
  FnRegisterDomain,
  FnResolveDomain,
  FnGetDomainList,
  FnGetWalletAddress,
  FnPumpFunTokenLaunch,
  FnCreateImageTool,
  FnLendAssetTool,
  FnStakeTool,
  FnTokenData,
  FnTPSCalculatorTool,
  FnTokenDataByTicker,
  FnCompressedAirdrop,
  FnCreateSingleSidedWhirlpool,
  FnRaydiumCreateAmmV4,
  FnRaydiumCreateClmm,
  FnRaydiumCreateCpmm,
  FnOpenbookCreateMarket,
  FnPythFetchPrice,
  FnResolveAllDomains,
  FnGetOwnedDomains,
  FnGetOwnedTldDomains,
  FnGetAllTlds,
  FnGetMainDomain,
  FnCreateGibworkTask,
  FnRope,
  FnTipLink,
  FnRockPaperScissors,
  FnCreateTiplink,
  FnFetchPrice,
};
