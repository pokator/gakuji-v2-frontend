interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastsProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export const Toasts = ({ toasts, onClose }: ToastsProps) => {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm px-4 py-2 rounded shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
          <div className="flex items-center justify-between gap-3">
            <div>{t.message}</div>
            <button onClick={() => onClose(t.id)} className="opacity-80 hover:opacity-100">×</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
