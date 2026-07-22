interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        style={{ borderWidth: 3 }}
      />
      {message && <p className="text-slate-500 text-sm">{message}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-blue-600 font-medium">Loading MIHE Portal…</p>
      </div>
    </div>
  );
}
