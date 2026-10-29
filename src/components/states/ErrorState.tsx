interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-labelledby="weather-error-title"
      className="rounded-2xl border border-rose-300/20 bg-white/5 p-6 text-white shadow-lg backdrop-blur-md"
    >
      <h2 id="weather-error-title" className="text-lg font-semibold text-rose-200">
        Não foi possível carregar os dados
      </h2>
      <p className="mt-2 text-sm text-white/75">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-xl bg-accent-500 px-4 py-2 font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </section>
  );
}
