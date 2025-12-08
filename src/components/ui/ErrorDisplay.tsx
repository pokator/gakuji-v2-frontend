interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <h2 className="text-red-800 font-bold mb-2">Error Loading Data</h2>
      <p className="text-red-600 text-sm mb-3">{message}</p>
      <p className="text-gray-600 text-xs">
        Please ensure <code className="bg-red-100 px-1 rounded">output.json</code> is in the same directory as this HTML file.
      </p>
    </div>
  </div>
);