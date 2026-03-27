import { describe, expectTypeOf, it } from "vitest";
import type { Paths, PathValue } from "../src/types.js";
import { get, set, has } from "../src/index.js";

// -- Test fixtures --

interface Config {
  db: {
    host: string;
    ports: number[];
  };
  auth: {
    providers: Array<{ name: string; clientId: string }>;
  };
}

interface WithOptional {
  a?: string;
  b: { c?: number };
}

interface WithTuple {
  pair: [number, string];
  nested: { items: [boolean, { deep: string }] };
}

interface WithDate {
  created: Date;
  meta: { updated: Date; tags: string[] };
}

interface WithUnion {
  data: { x: number } | { y: string };
}

type Circular = { self: Circular; value: number };

// -- Paths<T> tests --

describe("Paths<T>", () => {
  it("enumerates flat object paths", () => {
    type P = Paths<{ a: string; b: number }>;
    expectTypeOf<"a">().toExtend<P>();
    expectTypeOf<"b">().toExtend<P>();
  });

  it("enumerates nested object paths", () => {
    type P = Paths<Config>;
    expectTypeOf<"db">().toExtend<P>();
    expectTypeOf<"db.host">().toExtend<P>();
    expectTypeOf<"db.ports">().toExtend<P>();
    expectTypeOf<"auth">().toExtend<P>();
    expectTypeOf<"auth.providers">().toExtend<P>();
  });

  it("enumerates array index paths", () => {
    type P = Paths<Config>;
    expectTypeOf<`db.ports.${number}`>().toExtend<P>();
    expectTypeOf<`auth.providers.${number}`>().toExtend<P>();
    expectTypeOf<`auth.providers.${number}.name`>().toExtend<P>();
    expectTypeOf<`auth.providers.${number}.clientId`>().toExtend<P>();
  });

  it("enumerates tuple literal index paths", () => {
    type P = Paths<WithTuple>;
    expectTypeOf<"pair">().toExtend<P>();
    expectTypeOf<"pair.0">().toExtend<P>();
    expectTypeOf<"pair.1">().toExtend<P>();
    expectTypeOf<"nested.items.0">().toExtend<P>();
    expectTypeOf<"nested.items.1">().toExtend<P>();
    expectTypeOf<"nested.items.1.deep">().toExtend<P>();
  });

  it("includes optional property keys", () => {
    type P = Paths<WithOptional>;
    expectTypeOf<"a">().toExtend<P>();
    expectTypeOf<"b">().toExtend<P>();
    expectTypeOf<"b.c">().toExtend<P>();
  });

  it("does not recurse into built-in objects", () => {
    type P = Paths<WithDate>;
    expectTypeOf<"created">().toExtend<P>();
    expectTypeOf<"meta">().toExtend<P>();
    expectTypeOf<"meta.updated">().toExtend<P>();
    expectTypeOf<"meta.tags">().toExtend<P>();
  });

  it("handles union types via distribution", () => {
    type P = Paths<WithUnion>;
    expectTypeOf<"data">().toExtend<P>();
    expectTypeOf<"data.x">().toExtend<P>();
    expectTypeOf<"data.y">().toExtend<P>();
  });

  it("does not infinite-loop on circular types", () => {
    type P = Paths<Circular>;
    expectTypeOf<"self">().toExtend<P>();
    expectTypeOf<"value">().toExtend<P>();
    expectTypeOf<"self.value">().toExtend<P>();
    expectTypeOf<"self.self.value">().toExtend<P>();
  });
});

// -- PathValue<T, P> tests --

describe("PathValue<T, P>", () => {
  it("resolves shallow property types", () => {
    expectTypeOf<PathValue<Config, "db">>().toEqualTypeOf<{
      host: string;
      ports: number[];
    }>();
  });

  it("resolves deep property types", () => {
    expectTypeOf<PathValue<Config, "db.host">>().toEqualTypeOf<string>();
  });

  it("resolves array element types", () => {
    expectTypeOf<PathValue<Config, "db.ports">>().toEqualTypeOf<number[]>();
    expectTypeOf<
      PathValue<Config, `db.ports.${number}`>
    >().toEqualTypeOf<number>();
  });

  it("resolves tuple element types", () => {
    expectTypeOf<PathValue<WithTuple, "pair.0">>().toEqualTypeOf<number>();
    expectTypeOf<PathValue<WithTuple, "pair.1">>().toEqualTypeOf<string>();
  });

  it("resolves nested tuple object types", () => {
    expectTypeOf<
      PathValue<WithTuple, "nested.items.1.deep">
    >().toEqualTypeOf<string>();
  });

  it("includes undefined for optional properties", () => {
    expectTypeOf<PathValue<WithOptional, "a">>().toEqualTypeOf<
      string | undefined
    >();
  });

  it("resolves built-in object types as leaves", () => {
    expectTypeOf<PathValue<WithDate, "created">>().toEqualTypeOf<Date>();
    expectTypeOf<PathValue<WithDate, "meta.updated">>().toEqualTypeOf<Date>();
  });
});

// -- get() return type inference --

describe("get() type inference", () => {
  const config: Config = {
    db: { host: "localhost", ports: [5432, 5433] },
    auth: { providers: [{ name: "google", clientId: "xxx" }] },
  };

  it("infers string for string paths", () => {
    expectTypeOf(get(config, "db.host")).toEqualTypeOf<string>();
  });

  it("infers number for array index paths", () => {
    expectTypeOf(get(config, "db.ports.0")).toEqualTypeOf<number>();
  });

  it("infers object for object paths", () => {
    expectTypeOf(get(config, "db")).toEqualTypeOf<{
      host: string;
      ports: number[];
    }>();
  });

  it("rejects invalid paths at compile time", () => {
    // @ts-expect-error — "db.nope" is not a valid path
    get(config, "db.nope");

    // @ts-expect-error — "nope" is not a valid path
    get(config, "nope");

    // @ts-expect-error — empty string is not a valid path
    get(config, "");
  });
});

// -- set() type safety --

describe("set() type safety", () => {
  const config: Config = {
    db: { host: "localhost", ports: [5432] },
    auth: { providers: [{ name: "google", clientId: "xxx" }] },
  };

  it("returns the same object type", () => {
    expectTypeOf(set(config, "db.host", "0.0.0.0")).toEqualTypeOf<Config>();
  });

  it("rejects invalid paths at compile time", () => {
    // @ts-expect-error — "db.nope" is not a valid path
    set(config, "db.nope", "value");
  });
});

// -- has() type safety --

describe("has() type safety", () => {
  const config: Config = {
    db: { host: "localhost", ports: [5432] },
    auth: { providers: [{ name: "google", clientId: "xxx" }] },
  };

  it("returns boolean", () => {
    expectTypeOf(has(config, "db.host")).toEqualTypeOf<boolean>();
  });

  it("rejects invalid paths at compile time", () => {
    // @ts-expect-error — "db.nope" is not a valid path
    has(config, "db.nope");
  });
});
