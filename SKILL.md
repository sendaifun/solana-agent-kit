# Shadow Audit Skill: Jito-Aware Risk Detection

## Description
这是一个为 Solana Agent Kit 打造的高阶审计插件。它利用 Jupiter API 和 Jito 链路，在执行狙击前对目标代币进行“深度利差审计”。它能自动识别高风险的 Rug-pull 代币，并确保 Jito Tip 消耗不会侵蚀交易利润。

## Capabilities
- **Pre-execution Audit**: 自动通过 Alchemy RPC 获取代币池深度。
- **MEV Efficiency**: 动态计算最优 Jito Tip，避免过度支付。
- **Local AI Logic**: 兼容 M4 本地 LLM (如 Qwen 3)，实现零延迟链上决策。

## Triggers
- "分析该代币的 Jito 链路风险并执行狙击"
- "检查当前 RPC 节点是否支持跨链审计"

## Examples
"Agent, 请审计代币 7x... 并通过 Jito 链路以 0.05 SOL 执行买入"
