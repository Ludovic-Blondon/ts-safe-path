import type { Paths } from "./types.js";

/**
 * Type-safe deep existence check for a property path.
 *
 * Returns `true` if every segment of the path exists and is reachable,
 * `false` if any intermediate value is `null`, `undefined`, or missing.
 *
 * @param obj - The object to check
 * @param path - A dot-separated path string (autocomplete supported)
 * @returns `true` if the path exists, `false` otherwise
 *
 * @example
 * ```ts
 * const config = { db: { host: "localhost" } };
 *
 * has(config, "db.host"); // true
 * has(config, "db");      // true
 * ```
 */
export function has<T extends object>(
  obj: T,
  path: Paths<T> & string,
): boolean {
  const segments = path.split(".");
  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return false;
    }
    if (typeof current !== "object") {
      return false;
    }
    if (!(segment in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return true;
}
