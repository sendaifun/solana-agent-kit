interface ErrorResponse {
    error: boolean;
    message: string;
    type: string;
}

export const handleSolanaError = (error: unknown): ErrorResponse => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // User rejection cases
    if (errorMessage.includes('rejected') ||
        errorMessage.toLowerCase().includes('user rejected')) {
        return {
            error: true,
            message: 'Transaction cancelled by user',
            type: 'user_cancelled'
        };
    }

    // Timeout cases
    if (errorMessage.includes('timeout')) {
        return {
            error: true,
            message: 'Transaction timed out. The network might be congested.',
            type: 'timeout'
        };
    }

    // Airdrop specific errors
    if (errorMessage.includes('429')) {
        return {
            error: true,
            message: 'Too many requests. Please wait a moment before requesting more test SOL.',
            type: 'rate_limit'
        };
    }

    if (errorMessage.includes('airdrop') || errorMessage.includes('drip')) {
        return {
            error: true,
            message: 'Airdrop failed. The faucet might be empty or rate-limited.',
            type: 'airdrop_failed'
        };
    }

    // Generic transaction errors
    if (errorMessage.includes('insufficient')) {
        return {
            error: true,
            message: 'Insufficient balance for this transaction',
            type: 'insufficient_funds'
        };
    }

    if (errorMessage.includes('invalid')) {
        return {
            error: true,
            message: 'Invalid transaction parameters',
            type: 'invalid_params'
        };
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        return {
            error: true,
            message: 'Network error. Please check your connection and try again.',
            type: 'network_error'
        };
    }

    // Default case
    return {
        error: true,
        message: errorMessage,
        type: 'unknown'
    };
};