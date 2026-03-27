import type { Paths, PathValue } from "./types.js";

/**
 * Type-safe deep property access with full return type inference.
 *
 * The path is validated at compile time — invalid paths produce a type error.
 * The return type is automatically inferred from the path.
 *
 * @param obj - The object to access
 * @param path - A dot-separated path string (autocomplete supported)
 * @returns The value at the given path
 *
 * @example
 * ```ts
 * const config = { db: { host: "localhost", ports: [5432] } };
 *
 * get(config, "db.host");    // type: string, value: "localhost"
 * get(config, "db.ports.0"); // type: number, value: 5432
 * get(config, "db.nope");    // compile error
 * ```
 */
export function get<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P,
): PathValue<T, P> {
  const segments = path.split(".");
  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined as PathValue<T, P>;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current as PathValue<T, P>;
}
