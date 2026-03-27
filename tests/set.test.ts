import { describe, expect, it } from "vitest";
import { set } from "../src/set.js";

describe("set", () => {
  const config = {
    db: { host: "localhost", port: 5432 },
    auth: { enabled: true },
  };

  it("returns a new object with the value replaced", () => {
    const updated = set(config, "db.host", "0.0.0.0");
    expect(updated.db.host).toBe("0.0.0.0");
  });

  it("does not mutate the original object", () => {
    const original = {
      db: { host: "localhost", port: 5432 },
      auth: { enabled: true },
    };
    set(original, "db.host", "0.0.0.0");
    expect(original.db.host).toBe("localhost");
  });

  it("returns a different reference for the root", () => {
    const updated = set(config, "db.host", "0.0.0.0");
    expect(updated).not.toBe(config);
  });

  it("clones nodes along the path", () => {
    const updated = set(config, "db.host", "0.0.0.0");
    expect(updated.db).not.toBe(config.db);
  });

  it("preserves references for unchanged branches (structural sharing)", () => {
    const updated = set(config, "db.host", "0.0.0.0");
    expect(updated.auth).toBe(config.auth);
  });

  it("sets a shallow property", () => {
    const obj = { x: 1, y: 2 };
    const updated = set(obj, "x", 10);
    expect(updated.x).toBe(10);
    expect(updated.y).toBe(2);
  });

  it("sets a deeply nested property", () => {
    const deep = { a: { b: { c: { d: "old" } } } };
    const updated = set(deep, "a.b.c.d", "new");
    expect(updated.a.b.c.d).toBe("new");
    expect(deep.a.b.c.d).toBe("old");
  });

  it("sets an array element", () => {
    const data = { items: ["a", "b", "c"] };
    const updated = set(data, "items.1", "B");
    expect(updated.items).toEqual(["a", "B", "c"]);
    expect(data.items).toEqual(["a", "b", "c"]);
  });

  it("preserves array type when setting elements", () => {
    const data = { items: [1, 2, 3] };
    const updated = set(data, "items.0", 10);
    expect(Array.isArray(updated.items)).toBe(true);
    expect(updated.items).toEqual([10, 2, 3]);
  });

  it("sets a property within an array element", () => {
    const data = { users: [{ name: "Alice" }, { name: "Bob" }] };
    const updated = set(data, "users.0.name", "Alicia");
    expect(updated.users[0]?.name).toBe("Alicia");
    expect(updated.users[1]?.name).toBe("Bob");
    expect(data.users[0]?.name).toBe("Alice");
  });

  it("creates intermediate objects when path goes through null", () => {
    const data = { a: null as { b: string } | null };
    const updated = set(data, "a.b", "created");
    expect(updated.a?.b).toBe("created");
  });
});
