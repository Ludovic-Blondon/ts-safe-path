import { describe, expect, it } from "vitest";
import { get } from "../src/get.js";

const config = {
  db: {
    host: "localhost",
    ports: [5432, 5433],
  },
  auth: {
    providers: [
      { name: "google", clientId: "gid" },
      { name: "github", clientId: "ghid" },
    ],
  },
  flags: {
    debug: false,
    count: 0,
    label: "",
  },
};

describe("get", () => {
  it("accesses a shallow property", () => {
    expect(get(config, "db")).toEqual({
      host: "localhost",
      ports: [5432, 5433],
    });
  });

  it("accesses a nested string property", () => {
    expect(get(config, "db.host")).toBe("localhost");
  });

  it("accesses an array property", () => {
    expect(get(config, "db.ports")).toEqual([5432, 5433]);
  });

  it("accesses an array element by numeric index", () => {
    expect(get(config, "db.ports.0")).toBe(5432);
    expect(get(config, "db.ports.1")).toBe(5433);
  });

  it("accesses nested objects within arrays", () => {
    expect(get(config, "auth.providers.0.name")).toBe("google");
    expect(get(config, "auth.providers.1.clientId")).toBe("ghid");
  });

  it("handles falsy values correctly", () => {
    expect(get(config, "flags.debug")).toBe(false);
    expect(get(config, "flags.count")).toBe(0);
    expect(get(config, "flags.label")).toBe("");
  });

  it("works with deeply nested structures", () => {
    const deep = {
      a: { b: { c: { d: { e: { f: "found" } } } } },
    };
    expect(get(deep, "a.b.c.d.e.f")).toBe("found");
  });

  it("works with arrays at the root of nested objects", () => {
    const data = {
      items: [{ tags: ["a", "b"] }],
    };
    expect(get(data, "items.0.tags.0")).toBe("a");
    expect(get(data, "items.0.tags.1")).toBe("b");
  });

  it("returns undefined when an intermediate value is null", () => {
    const data = { a: null as { b: string } | null };
    expect(get(data, "a.b")).toBeUndefined();
  });
});
