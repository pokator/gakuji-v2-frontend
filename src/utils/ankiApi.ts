import type { BackendWordPayload, BackendKanjiPayload, AnkiBatchResponse } from './ankiSubmissionHelper';

// const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const BACKEND_BASE = 'http://localhost:8000';

/**
 * Maps backend error responses to user-friendly messages
 */
const parseErrorMessage = (status: number, errorDetail: string): string => {
  if (status === 400) {
    const lowerDetail = errorDetail.toLowerCase();
    if (lowerDetail.includes('not found') || lowerDetail.includes('invalid')) {
      return `Invalid request: ${errorDetail}`;
    }
    return `Invalid request: ${errorDetail}`;
  }

  if (status === 503) {
    if (errorDetail.toLowerCase().includes('anki')) {
      return 'Failed to connect to Anki. Is AnkiConnect running?';
    }
    if (errorDetail.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return 'Service unavailable. Please try again later.';
  }

  if (status === 500) {
    return 'Internal server error. Please contact support if the problem persists.';
  }

  return `Error: ${errorDetail}`;
};

/**
 * Submits words to the Anki backend
 * @throws Error with user-friendly message on failure
 */
export const submitWordsToAnki = async (
  payload: BackendWordPayload
): Promise<AnkiBatchResponse> => {
  try {
    const response = await fetch(`${BACKEND_BASE}/anki/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as AnkiBatchResponse | { detail?: string };

    if (!response.ok) {
      const errorDetail =
        typeof data === 'object' && 'detail' in data
          ? String(data.detail)
          : 'Failed to submit words to Anki';

      const friendlyError = parseErrorMessage(response.status, errorDetail);
      throw new Error(friendlyError);
    }

    return data as AnkiBatchResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to submit words to Anki. Please check your connection.');
  }
};

/**
 * Submits kanji to the Anki backend
 * @throws Error with user-friendly message on failure
 */
export const submitKanjiToAnki = async (
  payload: BackendKanjiPayload
): Promise<AnkiBatchResponse> => {
  try {
    const response = await fetch(`${BACKEND_BASE}/anki/kanji`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as AnkiBatchResponse | { detail?: string };

    if (!response.ok) {
      const errorDetail =
        typeof data === 'object' && 'detail' in data
          ? String(data.detail)
          : 'Failed to submit kanji to Anki';

      const friendlyError = parseErrorMessage(response.status, errorDetail);
      throw new Error(friendlyError);
    }

    return data as AnkiBatchResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to submit kanji to Anki. Please check your connection.');
  }
};
