/**
 * Built-in object types that should not be recursed into when enumerating paths.
 * Without this guard, `{ d: Date }` would enumerate all Date prototype methods as paths.
 */
type BuiltInObject =
  | Date
  | RegExp
  | Error
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>
  | Promise<unknown>
  | ArrayBuffer
  | SharedArrayBuffer
  | DataView
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>;

/**
 * Enumerates literal tuple indices as path segments.
 *
 * For `[number, string]`, produces `"0" | "1"` plus deeper paths for each element.
 */
type TuplePaths<
  T extends readonly unknown[],
  Depth extends unknown[],
  I extends unknown[] = [],
> = I["length"] extends T["length"]
  ? never
  :
      | `${I["length"]}`
      | (NonNullable<T[I["length"]]> extends BuiltInObject
          ? never
          : NonNullable<T[I["length"]]> extends object
            ? `${I["length"]}.${Paths<NonNullable<T[I["length"]]>, [...Depth, unknown]>}`
            : never)
      | TuplePaths<T, Depth, [...I, unknown]>;

/**
 * Handles path enumeration for array types.
 *
 * - Regular arrays (`string[]`): paths are `${number}` plus deeper paths through elements
 * - Tuples (`[number, string]`): paths use literal indices `"0"`, `"1"`, etc.
 */
type ArrayPaths<
  T extends readonly unknown[],
  Depth extends unknown[],
> = number extends T["length"]
  ?
      | `${number}`
      | (NonNullable<T[number]> extends BuiltInObject
          ? never
          : NonNullable<T[number]> extends object
            ? `${number}.${Paths<NonNullable<T[number]>, [...Depth, unknown]>}`
            : never)
  : TuplePaths<T, Depth>;

/**
 * Handles path enumeration for plain object types.
 *
 * For each string key, produces the key itself plus deeper paths through its value.
 * Uses `NonNullable` to recurse through optional properties without losing the ability
 * to continue path enumeration.
 */
type ObjectPaths<T, Depth extends unknown[]> = {
  [K in keyof T & string]:
    | K
    | (NonNullable<T[K]> extends BuiltInObject
        ? never
        : NonNullable<T[K]> extends object
          ? `${K}.${Paths<NonNullable<T[K]>, [...Depth, unknown]>}`
          : never);
}[keyof T & string];

/**
 * Recursively enumerates all valid dot-separated paths through an object type.
 *
 * @example
 * ```ts
 * type Config = { db: { host: string; ports: number[] } };
 * type P = Paths<Config>;
 * // = "db" | "db.host" | "db.ports" | `db.ports.${number}`
 * ```
 *
 * Features:
 * - Recursion depth capped at 10 levels to prevent infinite recursion on circular types
 * - Array indexing via `${number}` for regular arrays, literal indices for tuples
 * - Optional properties are included (their values wrapped with `NonNullable` for recursion)
 * - Built-in objects (Date, Map, Set, etc.) are treated as leaf values
 * - Union types distribute naturally through conditional types
 */
export type Paths<T, Depth extends unknown[] = []> = Depth["length"] extends 10
  ? never
  : T extends readonly unknown[]
    ? ArrayPaths<T, Depth>
    : T extends BuiltInObject
      ? never
      : T extends object
        ? ObjectPaths<T, Depth>
        : never;

/**
 * Resolves the value type at a given dot-separated path through an object type.
 *
 * @example
 * ```ts
 * type Config = { db: { host: string; ports: number[] } };
 * type Host = PathValue<Config, "db.host">; // string
 * type Port = PathValue<Config, "db.ports.0">; // number
 * ```
 *
 * Handles object keys, numeric array indices, and tuple element access.
 * For optional properties, the result includes `undefined` in the union.
 */
export type PathValue<
  T,
  P extends string,
> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ?
        | PathValue<NonNullable<T[Head]>, Tail>
        | (undefined extends T[Head] ? undefined : never)
    : T extends readonly unknown[]
      ? Head extends `${number}`
        ? PathValue<NonNullable<T[number]>, Tail>
        : never
      : never
  : P extends keyof T
    ? T[P]
    : T extends readonly unknown[]
      ? P extends `${number}`
        ? T[number]
        : never
      : never;
