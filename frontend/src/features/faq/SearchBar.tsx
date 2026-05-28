interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  resultCount?: number;
}

export function SearchBar({ value, onChange, loading, resultCount }: SearchBarProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="faq-search" className="block text-sm font-medium text-slate-700">
        Search FAQ
      </label>
      <div className="relative">
        <input
          id="faq-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by keyword (e.g. benefits, laptop, PTO)"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-describedby="faq-search-hint"
          autoComplete="off"
        />
        {loading ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            Searching…
          </span>
        ) : null}
      </div>
      <p id="faq-search-hint" className="text-xs text-slate-500">
        {typeof resultCount === 'number'
          ? `${resultCount} article${resultCount === 1 ? '' : 's'} found`
          : 'Find answers to common onboarding questions'}
      </p>
    </div>
  );
}
