import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';

export interface UserList {
  id: number | string;
  user: string;
  name: string;
  created_at?: string;
}

export const useLists = () => {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      if (!user) {
        setLists([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('lists').select('*').eq('user', user.id);
      if (error) throw error;
      setLists((data || []) as UserList[]);
    } catch (err) {
      console.error('[useLists] failed to load lists', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const createList = useCallback(async (name: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.from('lists').insert([{ user: user.id, name }]).select('*').single();
      if (error) throw error;
      const n = data as UserList;
      setLists(prev => [n, ...prev]);
      return n;
    } catch (err) {
      console.error('[useLists] failed to create list', err);
      return null;
    }
  }, [user]);

  const deleteList = useCallback(async (id: number | string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('lists').delete().eq('id', id);
      if (error) throw error;
      setLists(prev => prev.filter(l => String(l.id) !== String(id)));
      return true;
    } catch (err) {
      console.error('[useLists] failed to delete list', err);
      return false;
    }
  }, [user]);

  return { lists, loading, refresh: load, createList, deleteList };
};
