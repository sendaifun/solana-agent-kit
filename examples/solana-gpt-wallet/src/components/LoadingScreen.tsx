import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-gray-400">Loading wallet...</p>
            </div>
        </div>
    );
};