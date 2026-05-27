interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-slate-600">{description}</p>
      <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Feature content will be implemented in a future work order.
      </p>
    </section>
  );
}
