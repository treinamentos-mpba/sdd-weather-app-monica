interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Carregando dados meteorológicos...',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-white/25 border-t-accent-400"
      />
      <span>{message}</span>
    </div>
  );
}
