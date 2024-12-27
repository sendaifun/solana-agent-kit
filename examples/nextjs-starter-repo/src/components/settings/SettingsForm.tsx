'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from '../../types/settings';

interface SettingsFormProps {
  initialSettings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const [openAiKey, setOpenAiKey] = useState(initialSettings.openAiKey);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ openAiKey });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium">
          OpenAI API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={openAiKey}
          onChange={(e) => setOpenAiKey(e.target.value)}
          className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="sk-..."
          required
        />
        <p className="text-sm text-muted-foreground">
          Your API key will be stored locally and never sent to our servers.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </form>
  );
}