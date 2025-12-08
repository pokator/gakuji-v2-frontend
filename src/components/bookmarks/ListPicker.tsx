import { useEffect, useState } from 'react';
import { useLists } from '../../hooks/useLists';

interface ListPickerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkType: 'word' | 'kanji' | null;
  bookmarkKey: string | null;
  addBookmarkToList: (bookmark_type: string, key: string, listId: number | string) => Promise<boolean>;
  removeBookmarkFromList: (bookmark_type: string, key: string, listId: number | string) => Promise<boolean>;
  getListsForBookmark: (bookmark_type: string, key: string) => Promise<{ id: number | string; name: string }[]>;
}

export const ListPicker = ({ isOpen, onClose, bookmarkType, bookmarkKey, addBookmarkToList, removeBookmarkFromList, getListsForBookmark }: ListPickerProps) => {
  const { lists, loading, refresh, createList } = useLists();
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      refresh();
      setSelectedIds([]);
      (async () => {
        if (!bookmarkType || !bookmarkKey) return;
        try {
          const existing = await getListsForBookmark(bookmarkType, bookmarkKey);
          setSelectedIds(existing.map(e => e.id));
        } catch (err) {
          console.error('[ListPicker] failed getting lists for bookmark', err);
        }
      })();
    }
  }, [isOpen, bookmarkType, bookmarkKey, getListsForBookmark, refresh]);

  const toggleList = async (id: number | string, checked: boolean) => {
    if (!bookmarkType || !bookmarkKey) return;
    try {
      if (checked) {
        await addBookmarkToList(bookmarkType, bookmarkKey, id);
        setSelectedIds(prev => Array.from(new Set([...prev, id])));
      } else {
        await removeBookmarkFromList(bookmarkType, bookmarkKey, id);
        setSelectedIds(prev => prev.filter(x => String(x) !== String(id)));
      }
    } catch (err) {
      console.error('[ListPicker] toggleList error', err);
    }
  };

  const handleCreate = async () => {
    if (!newName || !bookmarkType || !bookmarkKey) return;
    try {
      const created = await createList(newName);
      if (created) {
        await addBookmarkToList(bookmarkType, bookmarkKey, created.id);
        setNewName('');
        refresh();
      }
    } catch (err) {
      console.error('[ListPicker] create list error', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-96 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Manage Lists</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : lists.length === 0 ? (
            <div className="text-sm text-gray-500">No lists yet. Create one below.</div>
          ) : (
            <ul className="space-y-2">
              {lists.map(l => (
                <li key={String(l.id)} className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.some(id => String(id) === String(l.id))}
                      onChange={(e) => toggleList(l.id, e.target.checked)}
                    />
                    <span className="text-sm">{l.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <div className="flex gap-2">
            <input type="text" className="flex-1 border px-2 py-1 rounded" placeholder="New list name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="bg-indigo-600 text-white px-3 py-1 rounded" onClick={handleCreate}>Create</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPicker;
