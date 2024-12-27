'use client';

import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={() => router.push('/settings')}
        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}