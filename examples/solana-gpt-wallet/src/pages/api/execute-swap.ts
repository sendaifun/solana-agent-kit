// pages/api/execute-swap.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface SwapResponse {
    message: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SwapResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            message: 'Method not allowed',
            error: 'Only POST requests are accepted'
        });
    }

    // Return a temporary message
    return res.status(200).json({
        message: 'Swaps are temporarily unavailable'
    });
}