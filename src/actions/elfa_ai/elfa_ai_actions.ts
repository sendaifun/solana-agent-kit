import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";

export const elfaPingAction: Action = {
  name: "ELFA_PING_ACTION",
  similes: ["ping elfa", "elfa health check", "check elfa api"],
  description: "Checks the health of the Elfa AI API by pinging it.",
  examples: [
    [
      {
        input: {},
        output: { status: "success", data: { message: "pong" } },
        explanation:
          "If the API is healthy, the ping endpoint returns a pong message.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const data = await agent.pingElfaAiApi();
    return {
      status: "success",
      data,
      message: "Elfa AI API ping successful",
    };
  },
};

export const elfaApiKeyStatusAction: Action = {
  name: "ELFA_API_KEY_STATUS_ACTION",
  similes: ["elfa api key status", "check api key", "api key info"],
  description: "Retrieves the status and usage details of the Elfa AI API key.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            success: true,
            data: {
              id: 160,
              key: "",
              name: "",
              status: "active",
              dailyRequestLimit: 1000,
              monthlyRequestLimit: 10000,
              expiresAt: "2026-01-12T13:57:12.884Z",
              createdAt: "2025-01-12T13:57:12.885Z",
              updatedAt: "2025-02-03T07:09:11.404Z",
              requestsPerMinute: 60,
              email: "",
              project: null,
              usage: {
                daily: 0,
                monthly: 136,
              },
              limits: {
                daily: 1000,
                monthly: 10000,
              },
              isExpired: false,
              remainingRequests: {
                daily: 1000,
                monthly: 9864,
              },
            },
          },
        },
        explanation:
          "Returns details such as remaining requests and API key status.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const data = await agent.getElfaAiApiKeyStatus();
    return {
      status: "success",
      data,
      message: "Elfa AI API key status retrieved successfully",
    };
  },
};

export const elfaGetSmartMentionsAction: Action = {
  name: "ELFA_GET_SMART_MENTIONS_ACTION",
  similes: ["get mentions", "smart mentions", "fetch mentions"],
  description:
    "Retrieves tweets by smart accounts with smart engagement from the Elfa AI API.",
  examples: [
    [
      {
        input: { limit: 100, offset: 0 },
        output: {
          status: "success",
          data: {
            success: true,
            data: [
              {
                id: "611245869",
                type: "post",
                content: "In my opinion, it’s a great time to add $ETH.",
                originalUrl: "/EricTrump/status/1886541132903133230",
                data: {
                  mediaUrls: [],
                },
                likeCount: 48036,
                quoteCount: 3103,
                replyCount: 8900,
                repostCount: 7981,
                viewCount: 5660995,
                mentionedAt: "2025-02-03T22:23:50.000Z",
                bookmarkCount: 1981,
                account: {
                  id: 83583,
                  username: "EricTrump",
                  data: {
                    name: "Eric Trump",
                    location: "Florida, USA",
                    userSince: "Mon May 11 21:42:30 +0000 2009",
                    description:
                      "Executive Vice President of The @Trump Organization. Husband to @LaraLeaTrump. Large advocate of @StJude Children's Hospital @TrumpWinery #MakeAmericaGreatAgain",
                    profileImageUrl:
                      "https://pbs.twimg.com/profile_images/1648453285890916355/rqqWLR8O_normal.jpg",
                    profileBannerUrl:
                      "https://pbs.twimg.com/profile_banners/39349894/1516709628",
                  },
                  followerCount: 5500559,
                  followingCount: 1204,
                  isVerified: true,
                },
              },
              {
                id: "611185071",
                type: "post",
                content:
                  "In my opinion, its a great time to add $ETH. You can thank me later.",
                originalUrl: "/EricTrump/status/1886533206188679576",
                data: {
                  mediaUrls: [],
                },
                likeCount: 20756,
                quoteCount: 2364,
                replyCount: 4392,
                repostCount: 3632,
                viewCount: 5391042,
                mentionedAt: "2025-02-03T21:52:21.000Z",
                bookmarkCount: 953,
                account: {
                  id: 83583,
                  username: "EricTrump",
                  data: {
                    name: "Eric Trump",
                    location: "Florida, USA",
                    userSince: "Mon May 11 21:42:30 +0000 2009",
                    description:
                      "Executive Vice President of The @Trump Organization. Husband to @LaraLeaTrump. Large advocate of @StJude Children's Hospital @TrumpWinery #MakeAmericaGreatAgain",
                    profileImageUrl:
                      "https://pbs.twimg.com/profile_images/1648453285890916355/rqqWLR8O_normal.jpg",
                    profileBannerUrl:
                      "https://pbs.twimg.com/profile_banners/39349894/1516709628",
                  },
                  followerCount: 5500559,
                  followingCount: 1204,
                  isVerified: true,
                },
              },
            ],
            metadata: {
              total: 6,
              limit: 100,
              offset: 0,
            },
          },
        },
        explanation: "Retrieves smart mentions with the provided parameters.",
      },
    ],
  ],
  schema: z.object({
    limit: z
      .number()
      .describe("Number of tweets to retrieve (default: 100)")
      .optional(),
    offset: z
      .number()
      .describe("Offset for pagination (default: 0)")
      .optional(),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const limit = input.limit ?? 100;
    const offset = input.offset ?? 0;
    const data = await agent.getSmartMentions(limit, offset);
    return {
      status: "success",
      data,
      message: "Smart mentions retrieved successfully",
    };
  },
};

export const elfaGetTopMentionsByTickerAction: Action = {
  name: "ELFA_GET_TOP_MENTIONS_BY_TICKER_ACTION",
  similes: [
    "top mentions",
    "get top mentions",
    "fetch top mentions",
    "top twitter mentions by ticker",
    "top tweets by ticker",
  ],
  description:
    "Retrieves top tweets for a given ticker symbol from the Elfa AI API.",
  examples: [
    [
      {
        input: {
          ticker: "SOL",
          timeWindow: "1h",
          page: 1,
          pageSize: 10,
          includeAccountDetails: false,
        },
        output: {
          status: "success",
          data: {
            success: true,
            data: {
              data: [
                {
                  id: 612200471,
                  twitter_id: "1886663937518645714",
                  twitter_user_id: "787634466",
                  content:
                    "Same story for $SOL - looks like a failed breakdown.\n\nHold above $205 today and we're good for another push towards the highs.\n\n🫡 ",
                  mentioned_at: "2025-02-04T06:31:49+00:00",
                  type: "post",
                  metrics: {
                    like_count: 45,
                    reply_count: 6,
                    repost_count: 7,
                    view_count: 1744,
                  },
                },
                {
                  id: 612210897,
                  twitter_id: "1886665123596480681",
                  twitter_user_id: "94261044",
                  content:
                    "You can take the puzzle out of your name now\n\nThe allocation is $1.41\n\nIf you spent 3 to 12 SOL on their NFTs, it gets you a $2.76 allocation\n\nAnd 90% of it is vested ",
                  mentioned_at: "2025-02-04T06:36:32+00:00",
                  type: "post",
                  metrics: {
                    like_count: 25,
                    reply_count: 20,
                    repost_count: 4,
                    view_count: 1355,
                  },
                },
              ],
              total: 12,
              page: 1,
              pageSize: 2,
            },
          },
        },
        explanation: "Top mentions for the ticker SOL are retrieved.",
      },
    ],
  ],
  schema: z.object({
    ticker: z
      .string()
      .min(1)
      .describe("Ticker symbol to retrieve mentions for"),
    timeWindow: z
      .string()
      .min(1)
      .optional()
      .describe("Time window for mentions (default: 1h)"),
    page: z.number().optional().describe("Page number for pagination"),
    pageSize: z.number().optional().describe("Number of mentions per page"),
    includeAccountDetails: z
      .boolean()
      .optional()
      .describe("Include account details in the response"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const ticker = input.ticker;
    if (!ticker) {
      throw new Error("Ticker is required.");
    }
    const timeWindow = input.timeWindow || "1h";
    const page = input.page || 1;
    const pageSize = input.pageSize || 10;
    const includeAccountDetails = input.includeAccountDetails || false;
    const data = await agent.getTopMentionsByTicker(
      ticker,
      timeWindow,
      page,
      pageSize,
      includeAccountDetails,
    );
    return {
      status: "success",
      data,
      message: "Top mentions retrieved successfully",
    };
  },
};

export const elfaSearchMentionsByKeywordsAction: Action = {
  name: "ELFA_SEARCH_MENTIONS_BY_KEYWORDS_ACTION",
  similes: [
    "search mentions",
    "find mentions by keywords",
    "tweets by keywords",
  ],
  description:
    "Searches for tweets by keywords within a specified date range using the Elfa AI API.",
  examples: [
    [
      {
        input: {
          keywords: "ai, agent",
          from: 1622505600,
          to: 1625097600,
          limit: 20,
        },
        output: {
          status: "success",
          data: {
            success: true,
            data: [
              {
                id: 612258820,
                twitter_id: "1886671035048845535",
                twitter_user_id: "1491526425580474368",
                content:
                  "The Move AI Hackathon 🛠️\n\nUnlock limitless possibilities at the intersection of AI &amp; Move on Aptos in this exciting opportunity to accelerate your Web3 journey—in collaboration with the Aptos Foundation and powered by @JouleFinance's Move AI Agent.\n\nWelcome to AIptos 🌐",
                mentioned_at: "2025-02-04T07:00:02+00:00",
                type: "quote",
                metrics: {
                  like_count: 1,
                  reply_count: 0,
                  repost_count: 0,
                  view_count: 0,
                },
              },
              {
                id: 612258423,
                twitter_id: "1886670992984162440",
                twitter_user_id: "1136430327176581120",
                content:
                  "Top 5 AI Agents Making Noise! 🎯\n\n1. $MISATO @Misato_virtuals\n2. $FMC @GetFameAI\n3. $POLY @Polytraderagent\n4. $ALI @real_alethea\n5. $TRIAS @triaslab\n\nBearish sentiment lingers, but smart traders know opportunities emerge in downturns. Are these the ones? ",
                mentioned_at: "2025-02-04T06:59:52+00:00",
                type: "post",
                metrics: {
                  like_count: 0,
                  reply_count: 0,
                  repost_count: 0,
                  view_count: 0,
                },
              },
            ],
            metadata: {
              total: 1875,
              cursor:
                "FGluY2x1ZGVfY29udGV4dF91dWlkDnF1ZXJ5VGhlbkZldGNoAxZBNTBtYmVEM1RUR2NycUdHUE9GMnN3AAAAAABm5oUWVERUVURyRHFRZ2VYY1F0cVh1UWloZxZMdjdsV2N5TVMzLU9LZkNFOWVWVlBBAAAAAAA25W0WWXBqUmN2eXlUNUdjakhFOGZ5XzZ5ZxZaZGpxTGV6WlFNNkxlNUhfMVotQy1RAAAAAABk8M0WVGV6RmdEOTNUT2lPN1JwZFROaC11QQ==",
            },
          },
        },
        explanation:
          "Tweets mentioning the keywords within the specified range are returned.",
      },
    ],
  ],
  schema: z.object({
    keywords: z
      .string()
      .min(1)
      .describe("Keywords to search for string separated by commas"),
    from: z.number().describe("Start date as unix timestamp"),
    to: z.number().describe("End date as unix timestamp"),
    limit: z
      .number()
      .optional()
      .describe("Number of tweets to retrieve (default: 20)"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const keywords = input.keywords;
    const from = input.from;
    const to = input.to;
    const limit = input.limit || 20;
    if (!keywords || !from || !to) {
      throw new Error("Keywords, from, and to fields are required.");
    }
    const data = await agent.searchMentionsByKeywords(
      keywords,
      from,
      to,
      limit,
    );
    return {
      status: "success",
      data,
      message: "Mentions search completed successfully",
    };
  },
};

export const elfaTrendingTokensAction: Action = {
  name: "ELFA_TRENDING_TOKENS_ACTION",
  similes: ["trending tokens", "get trending tokens", "fetch trending tokens"],
  description:
    "Retrieves trending tokens based on mentions from the Elfa AI API.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            success: true,
            data: {
              total: 5,
              page: 1,
              pageSize: 5,
              data: [
                {
                  token: "eth",
                  current_count: 916,
                  previous_count: 377,
                  change_percent: 142.97,
                },
                {
                  token: "btc",
                  current_count: 580,
                  previous_count: 458,
                  change_percent: 26.64,
                },
                {
                  token: "bitcoin",
                  current_count: 436,
                  previous_count: 324,
                  change_percent: 34.57,
                },
                {
                  token: "#bitcoin",
                  current_count: 423,
                  previous_count: 310,
                  change_percent: 36.45,
                },
                {
                  token: "sol",
                  current_count: 207,
                  previous_count: 191,
                  change_percent: 8.38,
                },
              ],
            },
          },
        },
        explanation:
          "Trending tokens are returned based on the latest mentions.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input) => {
    const data = await agent.getTrendingTokens();
    return {
      status: "success",
      data,
      message: "Trending tokens retrieved successfully",
    };
  },
};

export const elfaSmartTwitterAccountStats: Action = {
  name: "ELFA_SMART_TWITTER_ACCOUNT_STATS_ACTION",
  similes: [
    "account smart stats",
    "smart stats",
    "twitter account stats",
    "twitter account stats",
    "smart twitter stats",
  ],
  description:
    "Retrieves smart stats and social metrics for a specified Twitter account from the Elfa AI API.",
  examples: [
    [
      {
        input: { username: "elonmusk" },
        output: {
          status: "success",
          data: {
            success: true,
            data: {
              smartFollowingCount: 5913,
              averageEngagement: 30714784.98833819,
              followerEngagementRatio: 0.1423006675490259,
            },
          },
        },
        explanation:
          "Smart stats for the provided Twitter username are returned.",
      },
    ],
  ],
  schema: z.object({
    username: z
      .string()
      .min(1)
      .describe("Twitter username to retrieve stats for"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const username = input.username;
    if (!username) {
      throw new Error("Username is required.");
    }
    const data = await agent.getSmartTwitterAccountStats(username);
    return {
      status: "success",
      data,
      message: "Account smart stats retrieved successfully",
    };
  },
};
