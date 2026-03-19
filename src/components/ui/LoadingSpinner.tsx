import { Loader } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
      <p className="text-muted">Loading lyrics data...</p>
    </div>
  </div>
);