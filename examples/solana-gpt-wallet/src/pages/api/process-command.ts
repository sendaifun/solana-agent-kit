// src/pages/api/process-command.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GPTService } from '@/services/gpt.service';
import { WalletCommand } from '@/services/gpt.service';

interface CommandResponse {
    result?: WalletCommand;
    error?: string;
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<CommandResponse>
) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    try {
        const { input, publicKey, balance } = req.body;
        if (!input || !publicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const service = new GPTService(
            process.env.OPENAI_API_KEY,
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL
        );

        const response = await service.processUserInput(input, publicKey, balance);
        return res.status(200).json({ result: response });
    } catch (error) {
        console.error('Command processing error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
};

export default handler;