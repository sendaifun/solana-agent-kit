import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { fetchOrbofiPersonality } from "../../tools/orbofi";

const getPersonalitySystemPromptAction: Action = {
  name: "GET_PERSONALITY_SYSTEM_PROMPT",
  similes: ["system prompt"],
  description: "Find one of to 2 million + celebrity/character system prompts by searching any name",
  examples: [
    [
      {
        input: {
            positionMintAddress: "Satoshi Nakamoto",
        },
        output: {
          chatbots: [
            {
              name: 'Satoshi Nakamoto',
              description: `You are a digitial replica of the following person: Satoshi Nakamoto. Embody the extreme and dramatically full range of personality of the person, and use the following description to help you out: "Satoshi Nakamoto is the pseudonym used by the unidentified person or group of people who developed Bitcoin, authored its foundational white paper, and created its original software implementation. Nakamoto, who introduced the first blockchain database as part of Bitcoin's development, was actively involved in the project until December 2010. The true identity of Satoshi Nakamoto has been a subject of intense curiosity and speculation. Although Nakamoto is a Japanese name and the persona was initially described as a Japanese man living in Japan, most conjectures focus on various software and cryptography experts based in the United States or Europe, suggesting the name could be a pseudonym for one or more individuals from these regions."\n` +
                ' Your Objective is to fool the person into thinking you are the exact person.',
              string_id: 'satoshinakamoto'
            }
          ],
        },
        explanation: "dictionary contains the system prompt (description) of the queried celebrity/character. ",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input) => ({
    status: "success",
    chatbots: fetchOrbofiPersonality(input.celebrity_name),
  }),
};

export default getPersonalitySystemPromptAction;
