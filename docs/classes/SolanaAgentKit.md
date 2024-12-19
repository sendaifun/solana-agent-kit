[**solana-agent-kit v1.1.1**](../README.md)

***

[solana-agent-kit](../README.md) / SolanaAgentKit

# Class: SolanaAgentKit

Main class for interacting with Solana blockchain
Provides a unified interface for token operations, NFT management, and trading

 SolanaAgentKit

## Constructors

### new SolanaAgentKit()

> **new SolanaAgentKit**(`private_key`, `rpc_url`, `openai_api_key`): [`SolanaAgentKit`](SolanaAgentKit.md)

#### Parameters

##### private\_key

`string`

##### rpc\_url

`string` = `"https://api.mainnet-beta.solana.com"`

##### openai\_api\_key

`string`

#### Returns

[`SolanaAgentKit`](SolanaAgentKit.md)

#### Defined in

[agent/index.ts:39](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L39)

## Methods

### requestFaucetFunds()

> **requestFaucetFunds**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:51](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L51)

***

### deployToken()

> **deployToken**(`decimals`): `Promise`\<\{ `mint`: `PublicKey`; \}\>

#### Parameters

##### decimals

`number` = `DEFAULT_OPTIONS.TOKEN_DECIMALS`

#### Returns

`Promise`\<\{ `mint`: `PublicKey`; \}\>

#### Defined in

[agent/index.ts:55](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L55)

***

### deployCollection()

> **deployCollection**(`options`): `Promise`\<[`CollectionDeployment`](../interfaces/CollectionDeployment.md)\>

#### Parameters

##### options

[`CollectionOptions`](../interfaces/CollectionOptions.md)

#### Returns

`Promise`\<[`CollectionDeployment`](../interfaces/CollectionDeployment.md)\>

#### Defined in

[agent/index.ts:62](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L62)

***

### getBalance()

> **getBalance**(`token_address`?): `Promise`\<`null` \| `number`\>

#### Parameters

##### token\_address?

`PublicKey`

#### Returns

`Promise`\<`null` \| `number`\>

#### Defined in

[agent/index.ts:66](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L66)

***

### mintNFT()

> **mintNFT**(`collectionMint`, `metadata`, `recipient`?): `Promise`\<[`MintCollectionNFTResponse`](../interfaces/MintCollectionNFTResponse.md)\>

#### Parameters

##### collectionMint

`PublicKey`

##### metadata

###### name

`string`

###### symbol

`string`

###### uri

`string`

###### sellerFeeBasisPoints

`number`

###### creators

`object`[]

##### recipient?

`PublicKey`

#### Returns

`Promise`\<[`MintCollectionNFTResponse`](../interfaces/MintCollectionNFTResponse.md)\>

#### Defined in

[agent/index.ts:70](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L70)

***

### transfer()

> **transfer**(`to`, `amount`, `mint`?): `Promise`\<`string`\>

#### Parameters

##### to

`PublicKey`

##### amount

`number`

##### mint?

`PublicKey`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:78](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L78)

***

### registerDomain()

> **registerDomain**(`name`, `spaceKB`?): `Promise`\<`string`\>

#### Parameters

##### name

`string`

##### spaceKB?

`number`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:82](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L82)

***

### resolveSolDomain()

> **resolveSolDomain**(`domain`): `Promise`\<`PublicKey`\>

#### Parameters

##### domain

`string`

#### Returns

`Promise`\<`PublicKey`\>

#### Defined in

[agent/index.ts:86](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L86)

***

### getPrimaryDomain()

> **getPrimaryDomain**(`account`): `Promise`\<`string`\>

#### Parameters

##### account

`PublicKey`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:90](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L90)

***

### trade()

> **trade**(`outputMint`, `inputAmount`, `inputMint`?, `slippageBps`?): `Promise`\<`string`\>

#### Parameters

##### outputMint

`PublicKey`

##### inputAmount

`number`

##### inputMint?

`PublicKey`

##### slippageBps?

`number` = `DEFAULT_OPTIONS.SLIPPAGE_BPS`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:94](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L94)

***

### lendAssets()

> **lendAssets**(`amount`): `Promise`\<`string`\>

#### Parameters

##### amount

`number`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:103](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L103)

***

### getTPS()

> **getTPS**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[agent/index.ts:107](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L107)

***

### getTokenDataByAddress()

> **getTokenDataByAddress**(`mint`): `Promise`\<`undefined` \| [`JupiterTokenData`](../interfaces/JupiterTokenData.md)\>

#### Parameters

##### mint

`string`

#### Returns

`Promise`\<`undefined` \| [`JupiterTokenData`](../interfaces/JupiterTokenData.md)\>

#### Defined in

[agent/index.ts:111](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L111)

***

### getTokenDataByTicker()

> **getTokenDataByTicker**(`ticker`): `Promise`\<`undefined` \| [`JupiterTokenData`](../interfaces/JupiterTokenData.md)\>

#### Parameters

##### ticker

`string`

#### Returns

`Promise`\<`undefined` \| [`JupiterTokenData`](../interfaces/JupiterTokenData.md)\>

#### Defined in

[agent/index.ts:115](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L115)

***

### launchPumpFunToken()

> **launchPumpFunToken**(`tokenName`, `tokenTicker`, `description`, `imageUrl`, `options`?): `Promise`\<\{ `signature`: `string`; `mint`: `string`; `metadataUri`: `any`; \}\>

#### Parameters

##### tokenName

`string`

##### tokenTicker

`string`

##### description

`string`

##### imageUrl

`string`

##### options?

[`PumpFunTokenOptions`](../interfaces/PumpFunTokenOptions.md)

#### Returns

`Promise`\<\{ `signature`: `string`; `mint`: `string`; `metadataUri`: `any`; \}\>

#### Defined in

[agent/index.ts:119](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L119)

***

### stake()

> **stake**(`amount`): `Promise`\<`string`\>

#### Parameters

##### amount

`number`

#### Returns

`Promise`\<`string`\>

#### Defined in

[agent/index.ts:136](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L136)

## Properties

### connection

> **connection**: `Connection`

Solana RPC connection

#### Defined in

[agent/index.ts:34](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L34)

***

### wallet

> **wallet**: `Keypair`

Wallet keypair for signing transactions

#### Defined in

[agent/index.ts:35](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L35)

***

### wallet\_address

> **wallet\_address**: `PublicKey`

Public key of the wallet

#### Defined in

[agent/index.ts:36](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L36)

***

### openai\_api\_key

> **openai\_api\_key**: `string`

#### Defined in

[agent/index.ts:37](https://github.com/scriptscrypt/solana-agent-kit/blob/a820222cbc6538b7b24a8b29ee43679a229c9635/src/agent/index.ts#L37)
