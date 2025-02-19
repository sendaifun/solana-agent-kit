import { SolanaAgentKit } from "../../agent";

export async function somRouter(agent: SolanaAgentKit, query: string) {
  try {
    if (!agent.config.SOM_API_KEY) {
      throw new Error("No State of Mika API key provided");
    }

    const url = "https://state.gmika.io/api/v1/";
    const formData = new FormData();
    formData.append("query", query);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": agent.config.SOM_API_KEY,
      },
      body: formData,
    });
    const data = await res.json();

    return data;
  } catch (e) {
    throw new Error(`Error from State Of Mika router: ${e}`);
  }
}
