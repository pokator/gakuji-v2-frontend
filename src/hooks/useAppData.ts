import { useState, useEffect, useCallback } from 'react';
import type { AppData } from '../types';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const useAppData = (enabled: boolean, userId?: string | null) => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const LS_KEY_BASE = 'gakuji:lastLyrics';
  const getLsKey = useCallback(() => (userId ? `${LS_KEY_BASE}:${userId}` : `${LS_KEY_BASE}:anon`), [userId]);

  const fetchProcess = useCallback(async (lyrics: string) => {
    const res = await fetch(`${BACKEND_BASE}/process-lyrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lyrics }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }

    const data: AppData = await res.json();
    return data;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Prefer cached lyrics from localStorage if available (per-user)
        let lyrics = null;
        try {
          lyrics = localStorage.getItem(getLsKey());
        } catch {
          lyrics = null;
        }

        // If no cached lyrics, do not auto-load sample lyrics — show prompt instead
        if (!lyrics) {
          setLoading(false);
          return;
        }

        // We have cached lyrics for this user — start processing state so the UI
        // shows a loading indicator in the lyrics area while the backend runs.
        setLoading(false);
        setProcessing(true);
        setError(null);
        try {
          const data = await fetchProcess(lyrics);
          setAppData(data);
        } finally {
          setProcessing(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadData();
  }, [enabled, fetchProcess, getLsKey]);

  const processLyrics = useCallback(async (lyrics: string) => {
    setProcessing(true);
    setError(null);
    try {
      const data = await fetchProcess(lyrics);
      setAppData(data);
      try {
        localStorage.setItem(getLsKey(), lyrics);
      } catch {
        // ignore localStorage write errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [fetchProcess, getLsKey]);

  const clearLyrics = useCallback(() => {
    setAppData(null);
    setError(null);
    setLoading(false);
    try {
      localStorage.removeItem(getLsKey());
    } catch {
      // ignore
    }
  }, [getLsKey]);

  return { appData, loading, processing, error, processLyrics, clearLyrics };
};