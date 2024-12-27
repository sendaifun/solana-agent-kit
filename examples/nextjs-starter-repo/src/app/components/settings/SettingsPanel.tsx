'use client';

import { X } from 'lucide-react';
import { Settings } from '../../types/settings';
import ThemeToggle from '../theme/ThemeToggle';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSave }: SettingsPanelProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({ openAiKey: formData.get('apiKey') as string });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-background border-l transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              defaultValue={settings.openAiKey}
              className="w-full p-2 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="sk-..."
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}