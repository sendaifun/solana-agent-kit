import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SolanaApi implements ICredentialType {
	name = 'solanaApi';
	displayName = 'Solana API';
	documentationUrl = 'https://docs.solana.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The private key of your Solana wallet',
		},
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: 'https://api.mainnet-beta.solana.com',
			required: true,
			description: 'The URL of the Solana RPC node',
		},
		{
			displayName: 'OpenAI API Key',
			name: 'openAiApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API key for OpenAI services',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.rpcUrl}}',
			url: '/',
			method: 'POST',
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'getHealth',
			},
		},
	};
} 