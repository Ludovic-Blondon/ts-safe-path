import type { Paths, PathValue } from "./types.js";

/**
 * Immutable deep set — returns a new object with the value at the given path replaced.
 *
 * Uses structural sharing: only the nodes along the path are cloned,
 * all other branches share references with the original object.
 *
 * @param obj - The source object (not mutated)
 * @param path - A dot-separated path string (autocomplete supported)
 * @param value - The new value to set at the path
 * @returns A new object with the value replaced at the given path
 *
 * @example
 * ```ts
 * const config = { db: { host: "localhost", port: 5432 } };
 *
 * const updated = set(config, "db.host", "0.0.0.0");
 * // updated.db.host === "0.0.0.0"
 * // config.db.host === "localhost" (unchanged)
 * // updated.db !== config.db (cloned)
 * ```
 */
export function set<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P,
  value: PathValue<T, P>,
): T {
  const segments = path.split(".");
  return cloneAndSet(obj, segments, value) as T;
}

function cloneAndSet(
  obj: unknown,
  segments: string[],
  value: unknown,
): unknown {
  if (segments.length === 0) {
    return value;
  }

  const head = segments[0] as string;
  const tail = segments.slice(1);

  if (Array.isArray(obj)) {
    const clone = [...(obj as unknown[])];
    const index = Number(head);
    clone[index] = cloneAndSet(clone[index], tail, value);
    return clone;
  }

  const current = (obj ?? {}) as Record<string, unknown>;
  return {
    ...current,
    [head]: cloneAndSet(current[head], tail, value),
  };
}
