[**Documentation v2**](../../../README.md)

***

[Documentation](../../../README.md) / [@solana-agent-kit/plugin-misc](../README.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [index.ts:136](https://github.com/scriptscrypt/solana-agent-kit/blob/8d48a57968ef71c6851a44a8efa685e80e815610/packages/plugin-misc/src/index.ts#L136)

## Type declaration

### actions

> **actions**: `Action$1`[]

### initialize()

> **initialize**: (`agent`) => `void`

#### Parameters

##### agent

`SolanaAgentKit`

#### Returns

`void`

### methods

> **methods**: `object`

#### methods.askMessariAi()

> **methods.askMessariAi**: (`agent`, `question`) => `Promise`\<`any`\>

##### Parameters

###### agent

`SolanaAgentKit`

###### question

`string`

##### Returns

`Promise`\<`any`\>

#### methods.create\_HeliusWebhook()

> **methods.create\_HeliusWebhook**: (`agent`, `accountAddresses`, `webhookURL`) => `Promise`\<`HeliusWebhookResponse`\>

##### Parameters

###### agent

`SolanaAgentKit`

###### accountAddresses

`string`[]

###### webhookURL

`string`

##### Returns

`Promise`\<`HeliusWebhookResponse`\>

#### methods.create\_squads\_multisig()

> **methods.create\_squads\_multisig**: (`agent`, `creator`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Creates a new Squads multisig account.

##### Parameters

###### agent

`SolanaAgentKit`

The SolanaAgentKit instance containing the connection and wallet information.

###### creator

`PublicKey`

The public key of the creator who will be a member of the multisig.

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

A promise that resolves to the transaction ID of the multisig creation transaction.

##### Throws

Will throw an error if the transaction fails.

#### methods.create\_TipLink()

> **methods.create\_TipLink**: (`agent`, `amount`, `splmintAddress?`) => `Promise`\<`Transaction` \| \{ `signature`: `string`; `url`: `string`; \}\>

##### Parameters

###### agent

`SolanaAgentKit`

###### amount

`number`

###### splmintAddress?

`PublicKey`

##### Returns

`Promise`\<`Transaction` \| \{ `signature`: `string`; `url`: `string`; \}\>

#### methods.createGibworkTask()

> **methods.createGibworkTask**: (`agent`, `title`, `content`, `requirements`, `tags`, `tokenMintAddress`, `tokenAmount`, `payer?`) => `Promise`\<`GibworkCreateTaskReponse`\>

Create an new task on Gibwork

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### title

`string`

Title of the task

###### content

`string`

Description of the task

###### requirements

`string`

Requirements to complete the task

###### tags

`string`[]

List of tags associated with the task

###### tokenMintAddress

`PublicKey`

Token mint address for payment

###### tokenAmount

`number`

Payment amount for the task

###### payer?

`PublicKey`

Payer address for the task (default: agent wallet address)

##### Returns

`Promise`\<`GibworkCreateTaskReponse`\>

Object containing task creation transaction and generated taskId

#### methods.deleteHeliusWebhook()

> **methods.deleteHeliusWebhook**: (`agent`, `webhookID`) => `Promise`\<`any`\>

Deletes a Helius Webhook by its ID.

##### Parameters

###### agent

`SolanaAgentKit`

An instance of SolanaAgentKit (with .config.HELIUS_API_KEY)

###### webhookID

`string`

The unique ID of the webhook to delete

##### Returns

`Promise`\<`any`\>

The response body from the Helius API (which may contain status or other info)

#### methods.getAllDomainsTLDs()

> **methods.getAllDomainsTLDs**: (`agent`) => `Promise`\<`string`[]\>

Get all active top-level domains (TLDs) in the AllDomains Name Service

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

##### Returns

`Promise`\<`string`[]\>

Array of active TLD strings

#### methods.getAllRegisteredAllDomains()

> **methods.getAllRegisteredAllDomains**: (`agent`) => `Promise`\<`string`[]\>

Get all registered domains across all TLDs

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

##### Returns

`Promise`\<`string`[]\>

Array of all registered domain names with their TLDs

#### methods.getAllTopics()

> **methods.getAllTopics**: (`agent`) => `Promise`\<`AlloraTopic`[]\>

##### Parameters

###### agent

`SolanaAgentKit`

##### Returns

`Promise`\<`AlloraTopic`[]\>

#### methods.getAssetsByOwner()

> **methods.getAssetsByOwner**: (`agent`, `ownerPublicKey`, `limit`) => `Promise`\<`any`\>

Fetch assets by owner using the Helius Digital Asset Standard (DAS) API

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### ownerPublicKey

`PublicKey`

Owner's Solana wallet PublicKey

###### limit

`number`

Number of assets to retrieve per request

##### Returns

`Promise`\<`any`\>

Assets owned by the specified address

#### methods.getCoingeckoLatestPools()

> **methods.getCoingeckoLatestPools**: (`agent`) => `Promise`\<`any`\> = `getLatestPools`

##### Parameters

###### agent

`SolanaAgentKit`

##### Returns

`Promise`\<`any`\>

#### methods.getCoingeckoTokenInfo()

> **methods.getCoingeckoTokenInfo**: (`agent`, `tokenAddress`) => `Promise`\<`any`\> = `getTokenInfo`

##### Parameters

###### agent

`SolanaAgentKit`

###### tokenAddress

`string`

##### Returns

`Promise`\<`any`\>

#### methods.getCoingeckoTokenPriceData()

> **methods.getCoingeckoTokenPriceData**: (`agent`, `tokenAddresses`) => `Promise`\<`any`\> = `getTokenPriceData`

##### Parameters

###### agent

`SolanaAgentKit`

###### tokenAddresses

`string`[]

##### Returns

`Promise`\<`any`\>

#### methods.getCoingeckoTopGainers()

> **methods.getCoingeckoTopGainers**: (`agent`, `duration`, `topCoins`) => `Promise`\<`any`\> = `getTopGainers`

##### Parameters

###### agent

`SolanaAgentKit`

###### duration

`"1h"` | `"24h"` | `"7d"` | `"14d"` | `"30d"` | `"60d"` | `"1y"`

###### topCoins

`"all"` | `1000` | `300` | `500`

##### Returns

`Promise`\<`any`\>

#### methods.getCoingeckoTrendingPools()

> **methods.getCoingeckoTrendingPools**: (`agent`, `duration`) => `Promise`\<`any`\> = `getTrendingPools`

##### Parameters

###### agent

`SolanaAgentKit`

###### duration

`"1h"` | `"24h"` | `"5m"` | `"6h"`

##### Returns

`Promise`\<`any`\>

#### methods.getCoingeckoTrendingTokens()

> **methods.getCoingeckoTrendingTokens**: (`agent`) => `Promise`\<`any`\> = `getTrendingTokens`

##### Parameters

###### agent

`SolanaAgentKit`

##### Returns

`Promise`\<`any`\>

#### methods.getHeliusWebhook()

> **methods.getHeliusWebhook**: (`agent`, `webhookID`) => `Promise`\<`HeliusWebhookIdResponse`\>

Retrieves a Helius Webhook by ID, returning only the specified fields.

##### Parameters

###### agent

`SolanaAgentKit`

An instance of SolanaAgentKit (with .config.HELIUS_API_KEY)

###### webhookID

`string`

The unique ID of the webhook to retrieve

##### Returns

`Promise`\<`HeliusWebhookIdResponse`\>

A HeliusWebhook object containing { wallet, webhookURL, transactionTypes, accountAddresses, webhookType }

#### methods.getInferenceByTopicId()

> **methods.getInferenceByTopicId**: (`agent`, `topicId`) => `Promise`\<`AlloraInference`\>

##### Parameters

###### agent

`SolanaAgentKit`

###### topicId

`number`

##### Returns

`Promise`\<`AlloraInference`\>

#### methods.getMainAllDomainsDomain()

> **methods.getMainAllDomainsDomain**: (`agent`, `owner`) => `Promise`\<`null` \| `string`\>

Get the user's main/favorite domain for a SolanaAgentKit instance

##### Parameters

###### agent

`any`

SolanaAgentKit instance

###### owner

`PublicKey`

Owner's public key

##### Returns

`Promise`\<`null` \| `string`\>

Promise resolving to the main domain name or null if not found

#### methods.getOwnedAllDomains()

> **methods.getOwnedAllDomains**: (`agent`, `owner`) => `Promise`\<`string`[]\>

Get all domains owned domains for a specific TLD for the agent's wallet

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### owner

`PublicKey`

PublicKey of the owner

##### Returns

`Promise`\<`string`[]\>

Promise resolving to an array of owned domains or an empty array if none are found

#### methods.getOwnedDomainsForTLD()

> **methods.getOwnedDomainsForTLD**: (`agent`, `tld`) => `Promise`\<`string`[]\>

Get all domains owned by an address for a specific TLD

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### tld

`string`

Top-level domain (e.g., "sol")

##### Returns

`Promise`\<`string`[]\>

Promise resolving to an array of owned domain names for the specified TLD or an empty array if none are found

#### methods.getPriceInference()

> **methods.getPriceInference**: (`agent`, `tokenSymbol`, `timeframe`) => `Promise`\<`string`\>

##### Parameters

###### agent

`SolanaAgentKit`

###### tokenSymbol

`string`

###### timeframe

`string`

##### Returns

`Promise`\<`string`\>

#### methods.getPrimaryDomain()

> **methods.getPrimaryDomain**: (`agent`, `account`) => `Promise`\<`string`\>

Retrieves the primary .sol domain associated with a given Solana public key.

This function queries the Bonfida SPL Name Service to get the primary .sol domain for
a specified Solana public key. If the primary domain is stale or an error occurs during
the resolution, it throws an error.

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### account

`PublicKey`

The Solana public key for which to retrieve the primary domain

##### Returns

`Promise`\<`string`\>

A promise that resolves to the primary .sol domain as a string

##### Throws

Error if the domain is stale or if the domain resolution fails

#### methods.multisig\_approve\_proposal()

> **methods.multisig\_approve\_proposal**: (`agent`, `transactionIndex?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Approves a proposal in a Solana multisig wallet.

##### Parameters

###### agent

`SolanaAgentKit`

The Solana agent kit instance.

###### transactionIndex?

The index of the transaction to approve. If not provided, the current transaction index will be used.

`number` | `bigint`

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

##### Throws

- Throws an error if the approval process fails.

#### methods.multisig\_create\_proposal()

> **methods.multisig\_create\_proposal**: (`agent`, `transactionIndex?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Creates a proposal for a multisig transaction.

##### Parameters

###### agent

`SolanaAgentKit`

The Solana agent kit instance.

###### transactionIndex?

Optional transaction index. If not provided, the current transaction index will be used.

`number` | `bigint`

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

##### Throws

- Throws an error if the proposal creation fails.

#### methods.multisig\_deposit\_to\_treasury()

> **methods.multisig\_deposit\_to\_treasury**: (`agent`, `amount`, `vaultIndex?`, `mint?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Transfer SOL or SPL tokens to a multisig vault.

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### amount

`number`

Amount to transfer

###### vaultIndex?

`number`

Optional vault index, default is 0

###### mint?

`PublicKey`

Optional mint address for SPL tokens

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Transaction signature

#### methods.multisig\_execute\_proposal()

> **methods.multisig\_execute\_proposal**: (`agent`, `transactionIndex?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Executes a transaction on the Solana blockchain using the provided agent.

##### Parameters

###### agent

`SolanaAgentKit`

The Solana agent kit instance containing the wallet and connection.

###### transactionIndex?

Optional transaction index to execute. If not provided, the current transaction index from the multisig account will be used.

`number` | `bigint`

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

##### Throws

- Throws an error if the transaction execution fails.

#### methods.multisig\_reject\_proposal()

> **methods.multisig\_reject\_proposal**: (`agent`, `transactionIndex?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Rejects a proposal in a Solana multisig setup.

##### Parameters

###### agent

`SolanaAgentKit`

The SolanaAgentKit instance containing the wallet and connection.

###### transactionIndex?

Optional. The index of the transaction to reject. If not provided, the current transaction index will be used.

`number` | `bigint`

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

A promise that resolves to the transaction ID of the rejection transaction.

##### Throws

Will throw an error if the transaction fails.

#### methods.multisig\_transfer\_from\_treasury()

> **methods.multisig\_transfer\_from\_treasury**: (`agent`, `amount`, `to`, `vaultIndex`, `mint?`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Transfer SOL or SPL tokens to a recipient from a multisig vault.

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance.

###### amount

`number`

Amount to transfer.

###### to

`PublicKey`

Recipient's public key.

###### vaultIndex

`number` = `0`

Optional vault index, default is 0.

###### mint?

`PublicKey`

Optional mint address for SPL tokens.

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Transaction signature.

#### methods.parseAccountUsingSolanaFM()

> **methods.parseAccountUsingSolanaFM**: (`program_id`, `account_data`) => `Promise`\<`AccountParserResponse`\>

Parse a Solana account data

##### Parameters

###### program\_id

`string`

Solana program ID

###### account\_data

`string`

Solana account data

##### Returns

`Promise`\<`AccountParserResponse`\>

Object containing the program name, account data layout, parsed account data

#### methods.parseInstructionUsingSolanaFM()

> **methods.parseInstructionUsingSolanaFM**: (`program_id`, `instruction_data`) => `Promise`\<`InstructionParserResponse`\>

Parse a Solana instruction data

##### Parameters

###### program\_id

`string`

Solana program ID

###### instruction\_data

`string`

Solana instruction data

##### Returns

`Promise`\<`InstructionParserResponse`\>

Object containing the program name, instruction data layout, parsed instruction data

#### methods.parseTransaction()

> **methods.parseTransaction**: (`agent`, `transactionId`) => `Promise`\<`any`\>

Parse a Solana transaction using the Helius Enhanced Transactions API

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### transactionId

`string`

The transaction ID to parse

##### Returns

`Promise`\<`any`\>

Parsed transaction data

#### methods.registerDomain()

> **methods.registerDomain**: (`agent`, `name`, `spaceKB`) => `Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Register a .sol domain name using Bonfida Name Service

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### name

`string`

Domain name to register (without .sol)

###### spaceKB

`number` = `1`

Space allocation in KB (max 10KB)

##### Returns

`Promise`\<`string` \| `VersionedTransaction` \| `Transaction` \| `Transaction`[] \| `VersionedTransaction`[]\>

Transaction signature

#### methods.resolveAllDomains()

> **methods.resolveAllDomains**: (`agent`, `domain`) => `Promise`\<`undefined` \| `PublicKey`\>

Resolve all domains for a given agent and domain

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### domain

`string`

Domain name to resolve

##### Returns

`Promise`\<`undefined` \| `PublicKey`\>

Promise resolving to the domain or undefined if not found

#### methods.resolveSolDomain()

> **methods.resolveSolDomain**: (`agent`, `domain`) => `Promise`\<`PublicKey`\>

Resolves a .sol domain to a Solana PublicKey.

This function uses the Bonfida SPL Name Service to resolve a given .sol domain
to the corresponding Solana PublicKey. The domain can be provided with or without
the .sol suffix.

##### Parameters

###### agent

`SolanaAgentKit`

SolanaAgentKit instance

###### domain

`string`

The .sol domain to resolve. This can be provided with or without the .sol TLD suffix

##### Returns

`Promise`\<`PublicKey`\>

A promise that resolves to the corresponding Solana PublicKey

##### Throws

Error if the domain resolution fails

#### methods.sendTransactionWithPriorityFee()

> **methods.sendTransactionWithPriorityFee**: (`agent`, `priorityLevel`, `amount`, `to`, `splmintAddress?`) => `Promise`\<\{ `fee`: `number`; `transactionId`: `string`; \}\>

Sends a transaction with an estimated priority fee using the provided SolanaAgentKit.

##### Parameters

###### agent

`SolanaAgentKit`

An instance of SolanaAgentKit containing connection, wallet, etc.

###### priorityLevel

`string`

The priority level (e.g., "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax").

###### amount

`number`

The amount of SOL to send (in SOL, not lamports).

###### to

`PublicKey`

The recipient's PublicKey.

###### splmintAddress?

`PublicKey`

##### Returns

`Promise`\<\{ `fee`: `number`; `transactionId`: `string`; \}\>

The transaction signature (string) once confirmed along with the fee used.

#### methods.simulate\_switchboard\_feed()

> **methods.simulate\_switchboard\_feed**: (`feed`, `crossbarUrl`) => `Promise`\<`string`\>

Simulate a switchboard feed

##### Parameters

###### feed

`string`

Public key of the feed to simulate as base58

###### crossbarUrl

`string` = `SWITCHBOARD_DEFAULT_CROSSBAR`

The url of the crossbar instance to use

##### Returns

`Promise`\<`string`\>

Result of the simulation

### name

> **name**: `string` = `"misc"`
