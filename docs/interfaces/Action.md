[**solana-agent-kit v1.3.7**](../README.md)

***

[solana-agent-kit](../README.md) / Action

# Interface: Action

Defined in: [types/index.ts:125](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L125)

Main Action interface inspired by ELIZA
This interface makes it easier to implement actions across different frameworks

## Properties

### name

> **name**: `string`

Defined in: [types/index.ts:129](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L129)

Unique name of the action

***

### similes

> **similes**: `string`[]

Defined in: [types/index.ts:134](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L134)

Alternative names/phrases that can trigger this action

***

### description

> **description**: `string`

Defined in: [types/index.ts:139](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L139)

Detailed description of what the action does

***

### examples

> **examples**: [`ActionExample`](ActionExample.md)[][]

Defined in: [types/index.ts:145](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L145)

Array of example inputs and outputs for the action
Each inner array represents a group of related examples

***

### schema

> **schema**: `ZodType`

Defined in: [types/index.ts:150](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L150)

Zod schema for input validation

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Defined in: [types/index.ts:155](https://github.com/scriptscrypt/solana-agent-kit/blob/28121611ae2e5ee3f891044cd4631bfb441231fc/src/types/index.ts#L155)

Function that executes the action
