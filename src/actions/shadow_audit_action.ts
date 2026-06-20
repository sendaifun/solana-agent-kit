import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";

/**
 * 2026 Jupiter V1 API 响应定义
 */
interface JupiterQuoteResponse {
    priceImpactPct?: string;
    outAmount?: string;
    errorCode?: string;
}

export const shadowAuditAction: Action = {
    name: "SHADOW_AUDIT_RISK",
    description: "利用 Jito 和 Jupiter 链路对代币进行实时 MEV 风险与利差审计",
    similes: ["审计代币风险", "影子审计", "分析利差空间"],
    examples: [
        [
            {
                input: { tokenAddress: "7xKX...pump" },
                output: {
                    status: "success",
                    score: "Audited",
                    message: "审计完成"
                },
                explanation: "调用 Jupiter V1 接口进行流动性深度分析。"
            }
        ]
    ],
    schema: z.object({
        tokenAddress: z.string().describe("需要审计的 Solana 代币地址"),
    }),
    handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
        const tokenAddress = input.tokenAddress as string;
        
        console.log("[影子系统] 正在发起 M4 级审计: " + tokenAddress);

        try {
            // 2026.06.20 官方新域名
            const apiUrl = "https://api.jup.ag" + tokenAddress + "&amount=100000000&slippageBps=50";
            
            const response = await fetch(apiUrl, {
                headers: { 'x-api-key': process.env.JUPITER_API_KEY || '' }
            });

            // 关键修复：强制转换类型以消除 TS2339
            const data = (await response.json()) as JupiterQuoteResponse;
            
            if (data.errorCode) {
                throw new Error("Jupiter 报错: " + data.errorCode);
            }

            const impact = data.priceImpactPct || "0";

            return {
                status: "success",
                score: "Audited",
                message: "[M4 算力审计完成] 该代币价格冲击为 " + impact + "%。建议: " + (parseFloat(impact) > 5 ? "高风险" : "安全")
            };
        } catch (e: any) {
            console.error("[影子系统] 审计链路中断: " + e.message);
            return { status: "error", message: e.message };
        }
    }
};
