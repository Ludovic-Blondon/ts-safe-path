# Changelog

## 0.1.0

### Features

- `get(obj, path)` — Type-safe deep property access with full return type inference
- `set(obj, path, value)` — Immutable deep set with structural sharing
- `has(obj, path)` — Type-safe existence check for deep paths
- `Paths<T>` — Utility type enumerating all valid dot-separated paths
- `PathValue<T, P>` — Utility type resolving the value type at a given path
- Full autocomplete support for path strings
- Compile-time rejection of invalid paths
- Array and tuple indexing via numeric path segments
- Recursion depth protection (max 10 levels)
- Zero runtime dependencies
