import { z } from "zod";
import { Action } from "../../types";

const scrapeWebsiteAction: Action = {
  name: "SCRAPE_WEBSITE_ACTION",
  description: "Scrape content or news from external websites",
  similes: [
    "Scrape content from external websites",
    "scrape this website",
    "scrape this page",
  ],
  examples: [
    [
      {
        input: {
          query: "Tell me the trending news from bbc.co.uk",
        },
        explanation: "Scrape the trending news from bbc.co.uk",
        output: {
          original_query: "Tell me the trending news from bbc.co.uk",
          route: {
            tool: "scraper",
            confidence: 0.9,
            parameters: {
              url: "https://www.bbc.co.uk",
              instructions: "Get the trending news articles",
            },
            description:
              "The user is asking for trending news from a specific website (bbc.co.uk), which aligns with the capabilities of the scraper tool to extract content from external websites.",
          },
          response: {
            processed_response:
              "- Putin ready to speak to Zelensky 'if necessary', Kremlin says as US and Russia hold talks\n- Natasha Bedingfield covers an Oasis classic in the Piano Room\n- A body found in the Norwegian town of Larvik turns out to be an American",
            original_response: {
              original_url: "https://www.bbc.co.uk/",
              instructions:
                "Extract the top trending news headlines from the scraped data and present them in a bulleted list format.",
              processed_content: {
                url: "https://www.bbc.co.uk/",
                title: "Unknown Title",
                content:
                  "BBC Homepage Live. Putin ready to speak to Zelensky 'if necessary', Kremlin says as US and Russia hold talks The US says the talks are a first step to see if Russia is \"serious\" about peace - but Ukraine has not been invited. Keep up with the latest from BBC Sport The top stories from England, Scotland, Wales and Northern Ireland Latest news and must-see moments Natasha Bedingfield covers an Oasis classic in the Piano Room. Video, 24 minutes The singer teams up with the BBC Concert Orchestra to put her own spin on a Britpop classic along with a fresh take on two of her hit songs. - AttributionBBC Radio 2 - AttributionHistory of the BBC Meal ideas, cooking tips and more, updated daily to keep you inspired Tuck into these creamy and comforting risotto recipes on cold nights Perfect for midweek, here are all of our favourite risottos in one place. - AttributionBBC Food Is Essex really the county of grafters? 'I think we're built different around here,' says car boot sale trader Sonny Green. - Attribution Uplifting stories Insight and analysis A closer look at the week's stories New and trending on the BBC Add to your watchlist on iPlayer and subscribe on Sounds - AttributioniPlayer - AttributionSounds - AttributioniPlayer - AttributionSounds Discover more to watch and listen to A body found in the Norwegian town of Larvik turns out to be an American. Video, 42 minutes William Wisting, a widowed senior detective, leads an investigation that turns into an international hunt for a serial killer. - AttributionBBC Four - AttributionBBC World Service National Lottery draws See the latest results, including Lotto, EuroMillions, Set for Life and Thunderball",
                metadata: {
                  content_type: "news",
                  topic_category: "current events",
                  reading_time_minutes: "3",
                  content_quality: "high",
                  content_analysis:
                    "The content is relevant and timely, addressing significant geopolitical issues while also showcasing cultural events, reflecting the BBC's diverse coverage.",
                  key_insights: [
                    "Putin is open to discussions with Zelensky if necessary, indicating a potential shift in diplomatic relations.",
                    "The US and Russia are engaging in talks to assess Russia's commitment to peace.",
                    "Natasha Bedingfield's performance highlights the intersection of music and culture on BBC platforms.",
                  ],
                },
                summary:
                  "The BBC homepage features key news updates including potential talks between Putin and Zelensky, a performance by Natasha Bedingfield, and various cultural insights.",
                tags: ["news", "politics", "entertainment", "culture", "BBC"],
                word_count: "281",
                timestamp: "2025-02-18T10:32:31.469815",
              },
              error: "None",
            },
          },
        },
      },
    ],
  ],
  schema: z.object({
    query: z.string(),
  }),
  handler: async (agent, input) => {
    try {
      return {
        status: "success",
        result: await agent.scrapeWebsiteUsingSOM(input.query),
      };
    } catch (e) {
      return {
        status: "error",
        message: e,
      };
    }
  },
};

export default scrapeWebsiteAction;
