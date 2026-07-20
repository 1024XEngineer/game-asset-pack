export function deepMerge<T extends Record<string, unknown>>(
  current: T,
  patch: Record<string, unknown>,
): T {
  const merged = { ...current } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const existing = merged[key];
    if (
      value &&
      existing &&
      typeof value === "object" &&
      typeof existing === "object" &&
      !Array.isArray(value) &&
      !Array.isArray(existing)
    ) {
      merged[key] = deepMerge(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      merged[key] = value;
    }
  }
  return merged as T;
}

