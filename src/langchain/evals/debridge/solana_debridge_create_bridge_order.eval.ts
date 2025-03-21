import { runEvals } from "../utils/runEvals";

const DEBRIDGE_CREATE_ORDER_DATASET = [
  {
    inputs: {
      query: "Create a new cross-chain bridging order from Solana to BSC, bridging 100 USDC, tokenIn=8Ch8fBiqZGVkCL5D2ovvr5ZCKN7BcedY6t6SXrH12nTi, tokenOut=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d, recipient=0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    },
    referenceOutputs: {
      tool: "create_bridge_order",
      response: JSON.stringify({
        srcChainId: "7565164",
        srcChainTokenIn: "8Ch8fBiqZGVkCL5D2ovvr5ZCKN7BcedY6t6SXrH12nTi",
        srcChainTokenInAmount: "100000000",
        dstChainId: "56",
        dstChainTokenOut: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        dstChainTokenOutRecipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        senderAddress: ""
      }),
    },
  },
  {
    inputs: {
      query: "Create a cross chain bridging order from EVM to Solana bridging 50 USDT"
    },
    referenceOutputs: {
      tool: "create_bridge_order",
      response: JSON.stringify({
        srcChainId: "1",
        srcChainTokenIn: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        srcChainTokenInAmount: "50000000",
        dstChainId: "7565164",
        dstChainTokenOut: "",
        dstChainTokenOutRecipient: "",
        senderAddress: ""
      }),
    },
  },
];

runEvals(DEBRIDGE_CREATE_ORDER_DATASET, "create_bridge_order eval");