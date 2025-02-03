import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetHeliusWebhookTool extends Tool {
  name = "get_helius_webhook";
  description = `Retrieves a Helius Webhook by its ID.
  Inputs (input is a JSON string):
    webhookID: string, e.g. "1ed4244d-a591-4854-ac31-cc28d40b8255"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const webhookID = parsedInput.webhookID;
      if (!webhookID || typeof webhookID !== "string") {
        throw new Error(
          'Invalid input. Expected a "webhookID" property in the JSON.',
        );
      }

      const result = await this.solanaKit.getWebhook(webhookID);
      return JSON.stringify({
        status: "success",
        message: "Helius Webhook retrieved successfully",
        wallet: result.wallet,
        webhookURL: result.webhookURL,
        transactionTypes: result.transactionTypes,
        accountAddresses: result.accountAddresses,
        webhookType: result.webhookType,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
