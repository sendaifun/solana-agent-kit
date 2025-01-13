import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaHeliusWebhookTool extends Tool {
  name = "create_helius_webhook";
  description = `Creates a Helius Webhook that listens to specified account addresses.
    Inputs (input is a JSON string):
    accountAddresses: string[] | string, 
      e.g. ["BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP","Eo2ciguhMLmcTWXELuEQPdu7DWZt67LHXb2rdHZUbot7"]
      or "BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP,Eo2ciguhMLmcTWXELuEQPdu7DWZt67LHXb2rdHZUbot7"
    webhookURL: string, e.g. "https://TestServer.test.repl.co/webhooks"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      let accountAddresses: string[] = [];

      if (!parsedInput.accountAddresses) {
        throw new Error('Missing "accountAddresses" property in input JSON.');
      }
      if (Array.isArray(parsedInput.accountAddresses)) {
        accountAddresses = parsedInput.accountAddresses.map((addr: string) =>
          addr.trim(),
        );
      } else if (typeof parsedInput.accountAddresses === "string") {
        accountAddresses = parsedInput.accountAddresses
          .split(",")
          .map((addr: string) => addr.trim());
      } else {
        throw new Error(
          'Invalid type for "accountAddresses". Expected array or comma-separated string.',
        );
      }

      const webhookURL = parsedInput.webhookURL;
      if (!webhookURL) {
        throw new Error(
          'Invalid input. Expected a "webhookURL" property in the JSON.',
        );
      }
      const result = await this.solanaKit.CreateWebhook(
        accountAddresses,
        webhookURL,
      );

      // Return success in JSON
      return JSON.stringify({
        status: "success",
        message: "Helius Webhook created successfully",
        webhookURL: result.webhookURL,
        webhookID: result.webhookID,
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
