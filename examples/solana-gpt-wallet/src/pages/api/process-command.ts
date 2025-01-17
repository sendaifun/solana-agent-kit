import { NextApiRequest, NextApiResponse } from 'next';
import { GPTService } from '@/services/gpt.service';

interface CommandResponse {
    result?: any;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CommandResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { input, publicKey } = req.body;

        if (!input || !publicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Use GPTService instead of GPTWalletService
        const service = new GPTService(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
        const response = await service.processUserInput(input, publicKey);

        return res.status(200).json({ result: response });
    } catch (error) {
        console.error('Command processing error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}