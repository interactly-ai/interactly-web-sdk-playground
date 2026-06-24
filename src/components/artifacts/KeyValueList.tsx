function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  return String(v);
}

/** Renders only top-level primitive fields as a tidy definition list. */
export function KeyValueList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([, v]) => v === null || typeof v !== "object",
  );
  if (entries.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
            {k}
          </dt>
          <dd
            className="truncate text-sm text-foreground"
            title={formatValue(v)}
          >
            {formatValue(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
