'use client';

import { useState, useEffect } from 'react';
import { Settings } from '../types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings');
      return saved ? JSON.parse(saved) : { openAiKey: '' };
    }
    return { openAiKey: '' };
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
}