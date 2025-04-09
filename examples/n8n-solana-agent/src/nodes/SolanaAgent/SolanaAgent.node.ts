import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { SolanaAgentKit } from 'solana-agent-kit';

export class SolanaAgent implements INodeType {
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
		);

		for (let i = 0; i < items.length; i++) {
			try {
				let result;
				
				if (resource === 'token') {
					result = await this.handleTokenOperations(agent, operation, i);
				} else if (resource === 'nft') {
					result = await this.handleNFTOperations(agent, operation, i);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The resource "${resource}" is not supported!`,
					);
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

	private async handleTokenOperations(
		agent: SolanaAgentKit,
		operation: string,
		itemIndex: number,
	) {
		switch (operation) {
			case 'create':
				const tokenName = this.getNodeParameter('tokenName', itemIndex) as string;
				const tokenSymbol = this.getNodeParameter('tokenSymbol', itemIndex) as string;
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
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	}

	private async handleNFTOperations(
		agent: SolanaAgentKit,
		operation: string,
		itemIndex: number,
	) {
		switch (operation) {
			case 'deployCollection':
				const collectionName = this.getNodeParameter('collectionName', itemIndex) as string;
				const collectionSymbol = this.getNodeParameter('collectionSymbol', itemIndex) as string;
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
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	}
} 