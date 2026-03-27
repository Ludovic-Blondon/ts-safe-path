# ts-safe-path

[![CI](https://github.com/Ludovic-Blondon/ts-safe-path/actions/workflows/ci.yml/badge.svg)](https://github.com/Ludovic-Blondon/ts-safe-path/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ts-safe-path)](https://www.npmjs.com/package/ts-safe-path)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ts-safe-path)](https://bundlephobia.com/package/ts-safe-path)
[![license](https://img.shields.io/npm/l/ts-safe-path)](./LICENSE)

Type-safe deep property access with full path inference and autocomplete. Zero dependencies.

## Why ts-safe-path?

| Feature                      | `lodash.get` | `dot-prop` | `ts-toolbelt` Path   | **ts-safe-path** |
| ---------------------------- | ------------ | ---------- | -------------------- | ---------------- |
| Return type inference        | `any`        | `unknown`  | Partial              | Full             |
| Path autocomplete            | No           | No         | No                   | Yes              |
| Compile-time path validation | No           | No         | Partial              | Yes              |
| Array index support          | Yes          | Yes        | Partial              | Yes              |
| Tuple literal indices        | No           | No         | No                   | Yes              |
| Immutable `set`              | No           | No         | No                   | Yes              |
| Zero dependencies            | No           | Yes        | No                   | Yes              |
| Standalone                   | Yes          | Yes        | No (massive toolkit) | Yes              |

## Install

```bash
npm install ts-safe-path
```

Requires TypeScript 5.0+.

## Quick Start

```ts
import { get, set, has } from "ts-safe-path";

const config = {
  db: { host: "localhost", ports: [5432, 5433] },
  auth: { providers: [{ name: "google", clientId: "xxx" }] },
};

// Get with full type inference
get(config, "db.host"); // "localhost" (type: string)
get(config, "db.ports.0"); // 5432 (type: number)
get(config, "auth.providers.0.name"); // "google" (type: string)
get(config, "db.nope"); // ❌ compile error

// Immutable set with structural sharing
const updated = set(config, "db.host", "0.0.0.0");
// updated.db.host === "0.0.0.0"
// config.db.host === "localhost" (unchanged)

// Existence check
has(config, "db.host"); // true
```

## API

### `get<T, P>(obj: T, path: P): PathValue<T, P>`

Type-safe deep property access. The path is validated at compile time and the return type is inferred from the path.

```ts
const user = { profile: { name: "Alice", scores: [100, 95] } };

get(user, "profile.name"); // "Alice" (type: string)
get(user, "profile.scores.0"); // 100 (type: number)
```

### `set<T, P, V>(obj: T, path: P, value: V): T`

Immutable deep set. Returns a new object with the value replaced at the given path. Uses structural sharing — only the nodes along the path are cloned.

```ts
const config = { db: { host: "localhost", port: 5432 } };
const updated = set(config, "db.host", "0.0.0.0");

updated.db.host; // "0.0.0.0"
config.db.host; // "localhost" (not mutated)
updated.db !== config.db; // true (cloned)
```

### `has<T, P>(obj: T, path: P): boolean`

Type-safe existence check. Returns `true` if every segment of the path exists and is reachable.

```ts
const data = { a: { b: null } };
has(data, "a"); // true
has(data, "a.b"); // true
```

### `Paths<T>`

Utility type that enumerates all valid dot-separated paths through an object type. Use it for custom type constraints or autocomplete.

```ts
import type { Paths } from "ts-safe-path";

type Config = { db: { host: string; ports: number[] } };
type ConfigPaths = Paths<Config>;
// = "db" | "db.host" | "db.ports" | `db.ports.${number}`
```

### `PathValue<T, P>`

Utility type that resolves the value type at a given path.

```ts
import type { PathValue } from "ts-safe-path";

type Config = { db: { host: string; ports: number[] } };
type Host = PathValue<Config, "db.host">; // string
type Port = PathValue<Config, "db.ports.0">; // number
```

## Type Safety

### Compile-time path validation

Invalid paths are rejected at compile time with clear error messages:

```ts
get(config, "db.nope");
//                ~~~~  Argument of type '"db.nope"' is not assignable
```

### Autocomplete

Path arguments provide full autocomplete in IDEs — type `"db."` and see all valid continuations.

### Array and tuple support

```ts
const data = {
  items: ["a", "b"], // array: indexed via ${number}
  pair: [42, "hello"] as const, // tuple: indexed via "0", "1"
};

get(data, "items.0"); // type: string
get(data, "pair.0"); // type: 42
get(data, "pair.1"); // type: "hello"
```

### Optional properties

Optional properties are fully supported. `PathValue` includes `undefined` in the return type:

```ts
const obj: { a?: string } = {};
get(obj, "a"); // type: string | undefined
```

## Limitations

- **Keys containing `.`**: Property names with dots cannot be addressed since `.` is the path separator.
- **Recursion depth**: Path enumeration is capped at 10 levels to prevent infinite recursion on circular types. This is more than enough for practical use.
- **`Record<string, T>`**: `Paths` resolves to `string` for index signatures (any string key is valid). The type utilities work best with concrete object types.
- **`has` type narrowing**: `has()` returns `boolean`, not a type predicate. Deep type narrowing for arbitrary paths is not expressible in TypeScript.

## License

MIT
