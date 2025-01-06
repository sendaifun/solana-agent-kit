import { managePortfolio } from "./agents/manager";
import { samplePortfolio } from "./helper/examples";
import { SolanaClient } from "./utils/solanaClient";
(async () => {
    const solanaClient = new SolanaClient();
    const result = await managePortfolio(samplePortfolio, solanaClient);
    console.log("Portfolio management result:", result);
})();
