interface EmptyStateProps {
  title: string;
  tip: string;
}

export default function EmptyState({ title, tip }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-labelledby="empty-state-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-lg backdrop-blur-md"
    >
      <h2 id="empty-state-title" className="text-lg font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/70">{tip}</p>
    </section>
  );
}
