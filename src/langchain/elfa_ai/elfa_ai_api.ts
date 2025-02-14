import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class ElfaPingTool extends Tool {
  name = "elfa_ping";
  description = "Checks the health of the Elfa AI API by pinging it.";

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const data = await this.agent.pingElfaAiApi();
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaApiKeyStatusTool extends Tool {
  name = "elfa_api_key_status";
  description =
    "Retrieves the status and usage details of the Elfa AI API key.";

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const data = await this.agent.getElfaAiApiKeyStatus();
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaGetMentionsTool extends Tool {
  name = "elfa_get_smart_mentions";
  description = `Retrieves tweets by smart accounts with smart engagement from the Elfa AI API.

  Inputs (JSON string):
    - limit: number, eg 100 (optional)
    - offset: number, eg 0 (optional)`;

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const { limit = 100, offset = 0 } = parsedInput;
      const data = await this.agent.getSmartMentions(limit, offset);
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaGetTopMentionsTool extends Tool {
  name = "elfa_get_top_mentions";
  description = `Retrieves top tweets for a given ticker symbol from the Elfa AI API.

  Inputs (JSON string):
    - ticker: string, eg "SOL" (required)
    - timeWindow: string, eg "1h" (optional)
    - page: number, eg 1 (optional)
    - pageSize: number, eg 10 (optional)
    - includeAccountDetails: boolean, eg false (optional)`;

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const {
        ticker,
        timeWindow = "1h",
        page = 1,
        pageSize = 10,
        includeAccountDetails = false,
      } = parsedInput;
      if (!ticker) {
        throw new Error("Ticker is required.");
      }
      const data = await this.agent.getTopMentionsByTicker(
        ticker,
        timeWindow,
        page,
        pageSize,
        includeAccountDetails,
      );
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaSearchMentionsTool extends Tool {
  name = "elfa_search_mentions_by_keywords";
  description = `Searches for tweets by keywords within a specified date range using the Elfa AI API.

  Inputs (JSON string):
    - keywords : string, eg "ai, agents" (required)
    - from: number, eg 1738675001 (required)
    - to: number, eg 1738775001 (required)
    - limit: number, eg 20 (optional)`;

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const { keywords, from, to, limit = 20 } = parsedInput;
      if (!keywords || !from || !to) {
        throw new Error("Keywords, from, and to fields are required.");
      }
      const data = await this.agent.searchMentionsByKeywords(
        keywords,
        from,
        to,
        limit,
      );
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaTrendingTokensTool extends Tool {
  name = "elfa_trending_tokens";
  description = `Retrieves trending tokens based on mentions from the Elfa AI API.`;

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const data = await this.agent.getTrendingTokens();
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class ElfaAccountSmartStatsTool extends Tool {
  name = "elfa_account_smart_stats";
  description = `Retrieves smart stats and social metrics for a specified twitter account from the Elfa AI API.
  
  Inputs:
  username: string, eg "elonmusk" (required)`;

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const username = input.trim();
      const data = await this.agent.getSmartTwitterAccountStats(username);
      return JSON.stringify({ status: "success", data });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}
