export default {
  _format: "hh-sol-artifact-1",
  contractName: "MayanForwarder",
  sourceName: "src/MayanForwarder.sol",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_guardian",
          type: "address",
        },
        {
          internalType: "address[]",
          name: "_swapProtocols",
          type: "address[]",
        },
        {
          internalType: "address[]",
          name: "_mayanProtocols",
          type: "address[]",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "UnsupportedProtocol",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "protocolData",
          type: "bytes",
        },
      ],
      name: "ForwardedERC20",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "protocolData",
          type: "bytes",
        },
      ],
      name: "ForwardedEth",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "SwapAndForwarded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "tokenIn",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "swapProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "middleToken",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "middleAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "mayanData",
          type: "bytes",
        },
      ],
      name: "SwapAndForwardedERC20",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "swapProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "middleToken",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "middleAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "mayanData",
          type: "bytes",
        },
      ],
      name: "SwapAndForwardedEth",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newGuardian",
          type: "address",
        },
      ],
      name: "changeGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "claimGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenIn",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint8",
              name: "v",
              type: "uint8",
            },
            {
              internalType: "bytes32",
              name: "r",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "s",
              type: "bytes32",
            },
          ],
          internalType: "struct MayanForwarder.PermitParams",
          name: "permitParams",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "protocolData",
          type: "bytes",
        },
      ],
      name: "forwardERC20",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "protocolData",
          type: "bytes",
        },
      ],
      name: "forwardEth",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "guardian",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "mayanProtocols",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextGuardian",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "to",
          type: "address",
        },
      ],
      name: "rescueEth",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "rescueToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setMayanProtocol",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "swapProtocol",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setSwapProtocol",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenIn",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint8",
              name: "v",
              type: "uint8",
            },
            {
              internalType: "bytes32",
              name: "r",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "s",
              type: "bytes32",
            },
          ],
          internalType: "struct MayanForwarder.PermitParams",
          name: "permitParams",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "swapProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "swapData",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "middleToken",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "minMiddleAmount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "mayanData",
          type: "bytes",
        },
      ],
      name: "swapAndForwardERC20",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "swapProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "swapData",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "middleToken",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "minMiddleAmount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "mayanProtocol",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "mayanData",
          type: "bytes",
        },
      ],
      name: "swapAndForwardEth",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "swapProtocols",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  linkReferences: {},
  deployedLinkReferences: {},
};
