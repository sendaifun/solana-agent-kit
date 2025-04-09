import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { SolanaAgentKit } from 'solana-agent-kit';

// Define the expected methods interface
interface SolanaAgentMethods {
	deployToken(params: { name: string; symbol: string }): Promise<any>;
	deployCollection(params: { name: string; symbol: string }): Promise<any>;
}

// Extend SolanaAgentKit with the methods we need
type SolanaAgent = SolanaAgentKit & {
	methods: SolanaAgentMethods;
};

export class SolanaAgentNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Solana Agent',
		name: 'solanaAgent',
		icon: 'file:solana.svg',
		group: ['blockchain'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Solana blockchain using AI',
		defaults: {
			name: 'Solana Agent',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'solanaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Token',
						value: 'token',
					},
					{
						name: 'NFT',
						value: 'nft',
					},
					{
						name: 'DeFi',
						value: 'defi',
					},
				],
				default: 'token',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['token'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new token',
						action: 'Create a new token',
					},
					{
						name: 'Mint',
						value: 'mint',
						description: 'Mint tokens',
						action: 'Mint tokens',
					},
					{
						name: 'Transfer',
						value: 'transfer',
						description: 'Transfer tokens',
						action: 'Transfer tokens',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['nft'],
					},
				},
				options: [
					{
						name: 'Deploy Collection',
						value: 'deployCollection',
						description: 'Deploy a new NFT collection',
						action: 'Deploy a new NFT collection',
					},
					{
						name: 'Mint NFT',
						value: 'mintNFT',
						description: 'Mint a new NFT',
						action: 'Mint a new NFT',
					},
					{
						name: 'List for Sale',
						value: 'listForSale',
						description: 'List NFT for sale',
						action: 'List NFT for sale',
					},
				],
				default: 'deployCollection',
			},
			// Token Parameters
			{
				displayName: 'Token Name',
				name: 'tokenName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the token to create',
			},
			{
				displayName: 'Token Symbol',
				name: 'tokenSymbol',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Symbol of the token to create',
			},
			// NFT Parameters
			{
				displayName: 'Collection Name',
				name: 'collectionName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['deployCollection'],
					},
				},
				default: '',
				description: 'Name of the NFT collection',
			},
			{
				displayName: 'Collection Symbol',
				name: 'collectionSymbol',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['deployCollection'],
					},
				},
				default: '',
				description: 'Symbol of the NFT collection',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		
		// Get credentials
		const credentials = await this.getCredentials('solanaApi');
		
		// Initialize Solana Agent Kit
		const agent = new SolanaAgentKit(
			credentials.privateKey as string,
			credentials.rpcUrl as string,
			credentials.openAiApiKey as string,
		) as SolanaAgent;

		for (let i = 0; i < items.length; i++) {
			try {
				let result;
				
				if (resource === 'token') {
					result = await handleTokenOperations(this, agent, operation, i);
				} else if (resource === 'nft') {
					result = await handleNFTOperations(this, agent, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported!`);
				}

				returnData.push({
					json: result,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}
		
		return [returnData];
	}
}

async function handleTokenOperations(
	executeFunctions: IExecuteFunctions,
	agent: SolanaAgent,
	operation: string,
	itemIndex: number,
) {
	const tokenName = executeFunctions.getNodeParameter('tokenName', itemIndex) as string;
	const tokenSymbol = executeFunctions.getNodeParameter('tokenSymbol', itemIndex) as string;
	
	switch (operation) {
		case 'create':
			return await agent.methods.deployToken({
				name: tokenName,
				symbol: tokenSymbol,
			});
		case 'mint':
			// Implement mint operation
			break;
		case 'transfer':
			// Implement transfer operation
			break;
		default:
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`The operation "${operation}" is not supported for tokens!`,
			);
	}
}

async function handleNFTOperations(
	executeFunctions: IExecuteFunctions,
	agent: SolanaAgent,
	operation: string,
	itemIndex: number,
) {
	const collectionName = executeFunctions.getNodeParameter('collectionName', itemIndex) as string;
	const collectionSymbol = executeFunctions.getNodeParameter('collectionSymbol', itemIndex) as string;
	
	switch (operation) {
		case 'deployCollection':
			return await agent.methods.deployCollection({
				name: collectionName,
				symbol: collectionSymbol,
			});
		case 'mintNFT':
			// Implement mint NFT operation
			break;
		case 'listForSale':
			// Implement list for sale operation
			break;
		default:
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`The operation "${operation}" is not supported for NFTs!`,
			);
	}
} 