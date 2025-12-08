import { useState, useEffect, useCallback } from 'react';
import type { Bookmarks, BookmarkedWord, BookmarkedKanji } from '../types';
import { supabase } from '../utils/supabase';
import { cache } from '../utils/cache';
import { useAuth } from './useAuth';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const useBookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmarks>({ words: [], kanji: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarkDetails = useCallback(async (row: { bookmark_type?: string; bookmark?: string; created_at?: string | null }) => {
    try {
      if (row.bookmark_type === 'word') {
        // bookmark stores the idseq for words
        const idseq = String(row.bookmark ?? '');
        // check cache first (prefer fully populated entries)
        const cached = cache.getWord(idseq);
        if (cached && Array.isArray(cached.definitions) && cached.definitions.length > 0) {
          const bw: BookmarkedWord = {
            word: cached.word,
            furigana: cached.furigana,
            timestamp: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
            idseq: isNaN(Number(idseq)) ? idseq : Number(idseq)
          };
          return { type: 'word', item: bw };
        }
        // If cache is missing or incomplete, fetch full details from backend
        const res = await fetch(`${BACKEND_BASE}/word/${encodeURIComponent(idseq)}`);
        if (!res.ok) throw new Error('Failed to fetch word data');
        const data = await res.json();
        // Some endpoints return { word_info: { ... } }, normalize to the inner object
        const dRec = data as Record<string, unknown>;
        const payload = dRec && dRec.word_info ? (dRec.word_info as Record<string, unknown>) : (data as Record<string, unknown>);
        const p = payload as Record<string, unknown>;
        const bw: BookmarkedWord = {
          word: String(p['word'] ?? ''),
          furigana: String(p['furigana'] ?? ''),
          timestamp: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
          idseq: isNaN(Number(idseq)) ? idseq : Number(idseq)
        };
        try {
          // persist normalized WordEntry to cache for future
          const definitions = Array.isArray(p['definitions']) ? (p['definitions'] as unknown as import('../types').Definition[]) : [];
          cache.setWord(idseq, {
            idseq: typeof bw.idseq === 'number' ? bw.idseq : Number(bw.idseq ?? 0),
            word: bw.word,
            furigana: bw.furigana,
            definitions
          });
        } catch {
          /* ignore cache errors */
        }
        return { type: 'word', item: bw };
      }

      if (row.bookmark_type === 'kanji') {
        const char = String(row.bookmark ?? '');
        const cached = cache.getKanji(char);
        if (cached) {
          const bk: BookmarkedKanji = {
            char,
            meanings: cached.meanings || [],
            readings_on: cached.readings_on || [],
            readings_kun: cached.readings_kun || [],
            jlpt_new: cached.jlpt_new,
            radicals: cached.radicals || [],
            timestamp: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now()
          };
          return { type: 'kanji', item: bk };
        }
        const res = await fetch(`${BACKEND_BASE}/kanji/${encodeURIComponent(char)}`);
        if (!res.ok) throw new Error('Failed to fetch kanji data');
        const data = await res.json();

        // Normalize shapes: possible responses:
        // { jlpt_new, meanings, readings_on, readings_kun, radicals }
        // { kanji: '朝', data: { jlpt_new, meanings, readings_on, readings_kun, radicals } }
        // { kanji_info: { ... } }
        const dRec2 = data as Record<string, unknown>;
        let payload: Record<string, unknown>;
        if (dRec2 && dRec2.data && typeof dRec2.data === 'object') {
          payload = dRec2.data as Record<string, unknown>;
        } else if (dRec2 && dRec2.kanji_info && typeof dRec2.kanji_info === 'object') {
          payload = dRec2.kanji_info as Record<string, unknown>;
        } else {
          payload = data as Record<string, unknown>;
        }

        const p2 = payload as Record<string, unknown>;
        const bk: BookmarkedKanji = {
          char,
          meanings: Array.isArray(p2['meanings']) ? (p2['meanings'] as unknown as string[]) : [],
          readings_on: Array.isArray(p2['readings_on']) ? (p2['readings_on'] as unknown as string[]) : [],
          readings_kun: Array.isArray(p2['readings_kun']) ? (p2['readings_kun'] as unknown as string[]) : [],
          jlpt_new: typeof p2['jlpt_new'] === 'number' ? (p2['jlpt_new'] as number) : undefined,
          radicals: Array.isArray(p2['radicals']) ? (p2['radicals'] as unknown as string[]) : [],
          timestamp: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now()
        };
        try {
          cache.setKanji(char, {
            jlpt_new: bk.jlpt_new,
            meanings: bk.meanings,
            readings_on: bk.readings_on || [],
            readings_kun: bk.readings_kun || [],
            radicals: bk.radicals || []
          });
        } catch {
          /* ignore cache errors */
        }
        return { type: 'kanji', item: bk };
      }
    } catch (err) {
      console.error('[useBookmarks] Error fetching bookmark detail', err);
    }
    return null;
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (authLoading) return;
    setIsLoading(true);
    try {
      if (!user) {
        setBookmarks({ words: [], kanji: [] });
        setIsLoading(false);
        return;
      }
      // Fetch all bookmarks for user
      const { data: bmRows, error: bmErr } = await supabase.from('bookmarks').select('*').eq('user', user.id);
      if (bmErr) throw bmErr;

      const bookmarkRows = bmRows || [];

      // Fetch junction rows (bookmark_lists) with list metadata
      const bookmarkIds = bookmarkRows.map((r: any) => r.id).filter(Boolean);
      let linkRows: any[] = [];
      if (bookmarkIds.length > 0) {
        const { data: ldata, error: lerr } = await supabase
          .from('bookmark_lists')
          .select('bookmark_id, list_id, lists(id, name)')
          .in('bookmark_id', bookmarkIds as any[]);
        if (lerr) {
          console.error('[useBookmarks] failed loading bookmark_lists', lerr);
        } else {
          linkRows = ldata || [];
        }
      }

      const words: BookmarkedWord[] = [];
      const kanji: BookmarkedKanji[] = [];

      // fetch details for each bookmark row and attach lists
      for (const row of bookmarkRows) {
        const listsForRow = linkRows
          .filter(l => Number(l.bookmark_id) === Number(row.id))
          .map(l => ({ id: l.lists?.id ?? l.list_id, name: l.lists?.name ?? '' }));

        const detail = await fetchBookmarkDetails(row as any);
        if (!detail) continue;
        if (detail.type === 'word') {
          const w = detail.item as BookmarkedWord;
          w.lists = listsForRow;
          words.push(w);
        }
        if (detail.type === 'kanji') {
          const k = detail.item as BookmarkedKanji;
          k.lists = listsForRow;
          kanji.push(k);
        }
      }

      setBookmarks({ words, kanji });
    } catch (err) {
      console.error('Failed loading bookmarks from supabase', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, fetchBookmarkDetails]);

  // --- Optimistic local updates helpers ---
  const addLocalWordBookmark = useCallback((word: string, furigana = '', idseq?: number | string) => {
    const bw: BookmarkedWord = {
      word,
      furigana,
      timestamp: Date.now(),
      idseq: idseq as any
    };
    setBookmarks(prev => {
      const exists = prev.words.some(b => String(b.idseq ?? b.word) === String(idseq ?? word));
      if (exists) return prev;
      return { ...prev, words: [bw, ...prev.words] };
    });
  }, []);

  const removeLocalWordBookmark = useCallback((key: string | number) => {
    const sk = String(key);
    setBookmarks(prev => ({ ...prev, words: prev.words.filter(b => !(String(b.idseq ?? b.word) === sk || b.word === sk)) }));
  }, []);

  const addLocalKanjiBookmark = useCallback((char: string, data?: Partial<BookmarkedKanji>) => {
    const bk: BookmarkedKanji = {
      char,
      meanings: data?.meanings || [],
      readings_on: data?.readings_on || [],
      readings_kun: data?.readings_kun || [],
      jlpt_new: data?.jlpt_new,
      radicals: data?.radicals || [],
      timestamp: Date.now()
    };
    setBookmarks(prev => {
      const exists = prev.kanji.some(k => k.char === char);
      if (exists) return prev;
      return { ...prev, kanji: [bk, ...prev.kanji] };
    });
  }, []);

  const removeLocalKanjiBookmark = useCallback((char: string) => {
    setBookmarks(prev => ({ ...prev, kanji: prev.kanji.filter(k => k.char !== char) }));
  }, []);

  // Ensure default list exists for the user, return its id
  const ensureDefaultList = useCallback(async (): Promise<number | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.from('lists').select('id').match({ user: user.id, name: 'default' }).limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.id) return data.id as number;
      const { data: created, error: insErr } = await supabase.from('lists').insert([{ user: user.id, name: 'default' }]).select('id').single();
      if (insErr) throw insErr;
      return created.id as number;
    } catch (err) {
      console.error('[useBookmarks] ensureDefaultList error', err);
      return null;
    }
  }, [user]);

  // Ensure bookmark row exists and return its id
  const ensureBookmarkRow = useCallback(async (bookmark_type: string, key: string) => {
    if (!user) return null;
    try {
      const { data: existing, error: selErr } = await supabase.from('bookmarks').select('id').match({ user: user.id, bookmark_type, bookmark: key }).limit(1).single();
      if (selErr && selErr.code !== 'PGRST116') throw selErr;
      if (existing && existing.id) return existing.id as number;
      const { data: ins, error: insErr } = await supabase.from('bookmarks').insert([{ user: user.id, bookmark_type, bookmark: key }]).select('id').single();
      if (insErr) throw insErr;
      return ins.id as number;
    } catch (err) {
      console.error('[useBookmarks] ensureBookmarkRow error', err);
      return null;
    }
  }, [user]);

  // Add bookmark to a list (by list id)
  const addBookmarkToList = useCallback(async (bookmark_type: string, key: string, listId: number | string) => {
    if (!user) return false;
    try {
      const bookmarkId = await ensureBookmarkRow(bookmark_type, key);
      if (!bookmarkId) return false;
      // write minimal cache and optimistic local state so UI updates immediately
      try {
        if (bookmark_type === 'word') {
          cache.setWord(key, { idseq: Number(key) || 0, word: String(key), furigana: '', definitions: [] });
          addLocalWordBookmark(String(key), '', Number.isNaN(Number(key)) ? undefined : Number(key));
        } else if (bookmark_type === 'kanji') {
          cache.setKanji(key, { meanings: [], readings_on: [], readings_kun: [], radicals: [] });
          addLocalKanjiBookmark(String(key));
        }
      } catch {}
      const { error } = await supabase.from('bookmark_lists').insert([{ bookmark_id: bookmarkId, list_id: listId }]);
      if (error) {
        // ignore unique violation
        console.error('[useBookmarks] addBookmarkToList error', error);
        await loadBookmarks();
        return false;
      }
      await loadBookmarks();
      return true;
    } catch (err) {
      console.error('[useBookmarks] addBookmarkToList exception', err);
      return false;
    }
  }, [user, ensureBookmarkRow, loadBookmarks, addLocalWordBookmark, addLocalKanjiBookmark]);

  const removeBookmarkFromList = useCallback(async (bookmark_type: string, key: string, listId: number | string) => {
    if (!user) return false;
    // optimistic local removal so UI updates immediately
    try {
      if (bookmark_type === 'word') removeLocalWordBookmark(key);
      if (bookmark_type === 'kanji') removeLocalKanjiBookmark(key);
    } catch {}

    try {
      // find bookmark id
      const { data: existing, error: selErr } = await supabase.from('bookmarks').select('id').match({ user: user.id, bookmark_type, bookmark: key }).limit(1).single();
      if (selErr) throw selErr;
      if (!existing || !existing.id) return false;
      const bookmarkId = existing.id as number;
      const { error } = await supabase.from('bookmark_lists').delete().match({ bookmark_id: bookmarkId, list_id: listId });
      if (error) throw error;
      // optionally cleanup bookmark if no more lists
      const { data: remaining, error: remErr } = await supabase.from('bookmark_lists').select('bookmark_id').eq('bookmark_id', bookmarkId).limit(1);
      if (remErr) console.error('[useBookmarks] remaining check error', remErr);
      if (!remaining || remaining.length === 0) {
        await supabase.from('bookmarks').delete().eq('id', bookmarkId);
        try {
          // Evict cache entry for this bookmark when it's fully deleted
          if (bookmark_type === 'word') {
            cache.removeWord(key);
          } else if (bookmark_type === 'kanji') {
            cache.removeKanji(key);
          }
        } catch (err) {
          console.error('[useBookmarks] failed to evict cache for deleted bookmark', err);
        }
      }
      await loadBookmarks();
      return true;
    } catch (err) {
      console.error('[useBookmarks] removeBookmarkFromList exception', err);
      return false;
    }
  }, [user, loadBookmarks, removeLocalWordBookmark, removeLocalKanjiBookmark]);

  // Return the lists (id,name) that contain the given bookmark
  const getListsForBookmark = useCallback(async (bookmark_type: string, key: string) => {
    if (!user) return [] as { id: number | string; name: string }[];
    try {
      const { data: existing, error: selErr } = await supabase.from('bookmarks').select('id').match({ user: user.id, bookmark_type, bookmark: key }).limit(1).single();
      if (selErr) {
        console.error('[useBookmarks] getListsForBookmark select error', selErr);
        return [];
      }
      if (!existing || !existing.id) return [];
      const bookmarkId = existing.id as number;
      const { data, error } = await supabase.from('bookmark_lists').select('list_id, lists(id, name)').eq('bookmark_id', bookmarkId);
      if (error) {
        console.error('[useBookmarks] getListsForBookmark join error', error);
        return [];
      }
      return (data || []).map((r: Record<string, unknown>) => {
        const lists = r['lists'] as Record<string, unknown> | undefined;
        const rawId = lists?.['id'] ?? r['list_id'];
        const id = typeof rawId === 'number' ? rawId : String(rawId ?? '');
        const name = String(lists?.['name'] ?? '');
        return { id, name };
      });
    } catch (err) {
      console.error('[useBookmarks] getListsForBookmark exception', err);
      return [];
    }
  }, [user]);

  useEffect(() => {
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);


  const isWordBookmarked = useCallback((word: string): boolean => {
    return bookmarks.words.some(b => b.word === word);
  }, [bookmarks.words]);

  const isKanjiBookmarked = useCallback((char: string): boolean => {
    return bookmarks.kanji.some(b => b.char === char);
  }, [bookmarks.kanji]);

  const toggleWordBookmark = useCallback(async (word: string, _furigana: string, idseq?: number | string) => {
    if (!user) return;
    const key = idseq != null ? String(idseq) : word;
    try {
      // optimistic UI: determine current state and update locally immediately
      const currentlyBookmarked = bookmarks.words.some(b => String(b.idseq ?? b.word) === String(idseq ?? word));
      if (!currentlyBookmarked) {
        try {
          cache.setWord(key, {
            idseq: typeof idseq === 'number' ? idseq : Number(idseq ?? 0),
            word,
            furigana: _furigana || '',
            definitions: []
          });
        } catch {}
        addLocalWordBookmark(word, _furigana || '', idseq);
      } else {
        // optimistic remove
        removeLocalWordBookmark(key);
      }
    } catch {
      // ignore cache errors
    }
    try {
      // Use the normalized lists model: toggle membership in the user's "default" list
      const defaultListId = await ensureDefaultList();
      if (!defaultListId) {
        // Fallback: ensure a bookmark row exists or remove it if present
        const { data: existing, error: selErr } = await supabase
          .from('bookmarks')
          .select('*')
          .match({ user: user.id, bookmark_type: 'word', bookmark: key });
        if (selErr) throw selErr;
        if (existing && existing.length > 0) {
          const { error: delErr } = await supabase.from('bookmarks').delete().match({ user: user.id, bookmark_type: 'word', bookmark: key });
          if (delErr) throw delErr;
        } else {
          const { error: insErr } = await supabase.from('bookmarks').insert([{ user: user.id, bookmark_type: 'word', bookmark: key }]);
          if (insErr) throw insErr;
        }
        await loadBookmarks();
        return;
      }

      // Ensure bookmark row exists and then toggle link in bookmark_lists
      const bookmarkId = await ensureBookmarkRow('word', key);
      if (!bookmarkId) return;
      const { data: linkExisting, error: linkErr } = await supabase
        .from('bookmark_lists')
        .select('*')
        .match({ bookmark_id: bookmarkId, list_id: defaultListId });
      if (linkErr) throw linkErr;
      if (linkExisting && linkExisting.length > 0) {
        await removeBookmarkFromList('word', key, defaultListId);
      } else {
        await addBookmarkToList('word', key, defaultListId);
      }
    } catch (err) {
      console.error('Failed toggling word bookmark', err);
    }
  }, [user, loadBookmarks, ensureDefaultList, ensureBookmarkRow, addBookmarkToList, removeBookmarkFromList, bookmarks, addLocalWordBookmark, removeLocalWordBookmark]);


  const toggleKanjiBookmark = useCallback(async (charOrBookmark: string | BookmarkedKanji) => {
    if (!user) return;
    const char = typeof charOrBookmark === 'string' ? charOrBookmark : charOrBookmark.char;
    try {
      // if caller provided a full bookmark object, persist kanji data to cache
      if (typeof charOrBookmark !== 'string') {
        const kb = charOrBookmark as BookmarkedKanji;
        cache.setKanji(char, {
          jlpt_new: kb.jlpt_new,
          meanings: kb.meanings || [],
          readings_on: kb.readings_on || [],
          readings_kun: kb.readings_kun || [],
          radicals: kb.radicals || []
        });
        // optimistic add
        addLocalKanjiBookmark(char, kb as Partial<BookmarkedKanji>);
      }
    } catch {
      /* ignore cache errors */
    }
    // optimistic toggle: if currently bookmarked remove locally, else add locally
    try {
      const currentlyBookmarked = bookmarks.kanji.some(k => k.char === char);
      if (currentlyBookmarked) {
        removeLocalKanjiBookmark(char);
      } else {
        addLocalKanjiBookmark(char);
      }
    } catch {}
    try {
      const defaultListId = await ensureDefaultList();
      if (!defaultListId) {
        const { data: existing, error: selErr } = await supabase
          .from('bookmarks')
          .select('*')
          .match({ user: user.id, bookmark_type: 'kanji', bookmark: char });
        if (selErr) throw selErr;
        if (existing && existing.length > 0) {
          const { error: delErr } = await supabase.from('bookmarks').delete().match({ user: user.id, bookmark_type: 'kanji', bookmark: char });
          if (delErr) throw delErr;
        } else {
          const { error: insErr } = await supabase.from('bookmarks').insert([{ user: user.id, bookmark_type: 'kanji', bookmark: char }]);
          if (insErr) throw insErr;
        }
        await loadBookmarks();
        return;
      }

      const bookmarkId = await ensureBookmarkRow('kanji', char);
      if (!bookmarkId) return;
      const { data: linkExisting, error: linkErr } = await supabase
        .from('bookmark_lists')
        .select('*')
        .match({ bookmark_id: bookmarkId, list_id: defaultListId });
      if (linkErr) throw linkErr;
      if (linkExisting && linkExisting.length > 0) {
        await removeBookmarkFromList('kanji', char, defaultListId);
      } else {
        await addBookmarkToList('kanji', char, defaultListId);
      }
    } catch (err) {
      console.error('Failed toggling kanji bookmark', err);
    }
  }, [user, loadBookmarks, ensureDefaultList, ensureBookmarkRow, addBookmarkToList, removeBookmarkFromList, bookmarks, addLocalKanjiBookmark, removeLocalKanjiBookmark]);

  const removeKanjiBookmark = useCallback(async (char: string) => {
    if (!user) return;
    try {
      // find bookmark id
      const { data: existing, error: selErr } = await supabase.from('bookmarks').select('id').match({ user: user.id, bookmark_type: 'kanji', bookmark: char }).limit(1).single();
      if (selErr) throw selErr;
      if (!existing || !existing.id) return;
      const bookmarkId = existing.id as number;
      // delete all list links
      const { error: delLinksErr } = await supabase.from('bookmark_lists').delete().match({ bookmark_id: bookmarkId });
      if (delLinksErr) console.error('[useBookmarks] error deleting bookmark_links', delLinksErr);
      // delete bookmark row
      const { error: delErr } = await supabase.from('bookmarks').delete().eq('id', bookmarkId);
      if (delErr) throw delErr;
      try {
        cache.removeKanji(char);
      } catch (err) {
        console.error('[useBookmarks] failed to evict kanji cache after deletion', err);
      }
      await loadBookmarks();
    } catch (err) {
      console.error('Failed removing kanji bookmark', err);
    }
  }, [user, loadBookmarks]);

  const clearAllBookmarks = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('user', user.id);
      if (error) throw error;
      setBookmarks({ words: [], kanji: [] });
      try {
        // Remove any cached entries since bookmarks were cleared
        cache.clear();
      } catch (err) {
        console.error('[useBookmarks] failed to clear cache after clearing bookmarks', err);
      }
    } catch (err) {
      console.error('Failed clearing bookmarks', err);
    }
  }, [user]);

  return {
    bookmarks,
    isLoading,
    isWordBookmarked,
    isKanjiBookmarked,
    toggleWordBookmark,
    toggleKanjiBookmark,
    removeKanjiBookmark,
    clearAllBookmarks,
    addBookmarkToList,
    removeBookmarkFromList,
    getListsForBookmark
    ,
    refresh: loadBookmarks
  };
};