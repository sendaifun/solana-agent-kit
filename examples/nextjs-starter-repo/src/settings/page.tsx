'use client';

import { useSettings } from '../app/hooks/useSettings';
import SettingsForm from '../components/settings/SettingsForm';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your chat application settings.</p>
        </div>
        <SettingsForm initialSettings={settings} onSave={setSettings} />
      </div>
    </div>
  );
}