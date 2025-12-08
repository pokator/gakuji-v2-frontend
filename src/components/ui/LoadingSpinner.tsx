import { Loader } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
      <p className="text-gray-600">Loading lyrics data...</p>
    </div>
  </div>
);