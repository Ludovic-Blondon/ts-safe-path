import { describe, expect, it } from "vitest";
import { has } from "../src/has.js";

describe("has", () => {
  const config = {
    db: { host: "localhost", ports: [5432] },
    flags: {
      debug: false,
      count: 0,
      label: "",
      nil: null as string | null,
    },
  };

  it("returns true for existing shallow paths", () => {
    expect(has(config, "db")).toBe(true);
    expect(has(config, "flags")).toBe(true);
  });

  it("returns true for existing nested paths", () => {
    expect(has(config, "db.host")).toBe(true);
    expect(has(config, "db.ports")).toBe(true);
  });

  it("returns true for array index paths", () => {
    expect(has(config, "db.ports.0")).toBe(true);
  });

  it("returns true for falsy values (false, 0, empty string)", () => {
    expect(has(config, "flags.debug")).toBe(true);
    expect(has(config, "flags.count")).toBe(true);
    expect(has(config, "flags.label")).toBe(true);
  });

  it("returns true for null values (the key exists)", () => {
    expect(has(config, "flags.nil")).toBe(true);
  });

  it("works with deeply nested structures", () => {
    const deep = { a: { b: { c: { d: "found" } } } };
    expect(has(deep, "a.b.c.d")).toBe(true);
    expect(has(deep, "a.b.c")).toBe(true);
  });

  it("returns false when an intermediate is null", () => {
    const data = { a: null as { b: string } | null };
    expect(has(data, "a.b")).toBe(false);
  });

  it("returns false when an intermediate is a primitive", () => {
    // At runtime b is a string, so "b.c" traversal fails
    const data = { a: { b: "hello" } } as { a: { b: { c: number } } };
    expect(has(data, "a.b.c")).toBe(false);
  });

  it("returns false when a key does not exist at runtime", () => {
    const data = { a: {} as { b?: string } };
    expect(has(data, "a.b")).toBe(false);
  });
});
