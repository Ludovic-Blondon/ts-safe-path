import { Bench } from "tinybench";
import lodashGet from "lodash/get.js";
import { getProperty } from "dot-prop";
import { get } from "../src/get.js";

const config = {
  db: {
    host: "localhost",
    ports: [5432, 5433],
    settings: {
      pool: { min: 2, max: 10 },
      timeout: 5000,
    },
  },
  auth: {
    providers: [
      { name: "google", clientId: "gid", options: { scope: "email" } },
      { name: "github", clientId: "ghid", options: { scope: "repo" } },
    ],
  },
};

async function run() {
  console.log("ts-safe-path benchmark\n");

  // -- Shallow access (1 level) --
  const shallow = new Bench({ time: 500, warmupTime: 100 });
  shallow
    .add("ts-safe-path", () => get(config, "db"))
    .add("lodash.get", () => lodashGet(config, "db"))
    .add("dot-prop", () => getProperty(config, "db"))
    .add("native", () => config.db);
  await shallow.run();
  console.log("Shallow access (1 level):");
  console.table(shallow.table());

  // -- Medium access (3 levels) --
  const medium = new Bench({ time: 500, warmupTime: 100 });
  medium
    .add("ts-safe-path", () => get(config, "db.settings.pool"))
    .add("lodash.get", () => lodashGet(config, "db.settings.pool"))
    .add("dot-prop", () => getProperty(config, "db.settings.pool"))
    .add("native", () => config.db.settings.pool);
  await medium.run();
  console.log("Medium access (3 levels):");
  console.table(medium.table());

  // -- Deep access (4+ levels) --
  const deep = new Bench({ time: 500, warmupTime: 100 });
  deep
    .add("ts-safe-path", () => get(config, "auth.providers.0.options.scope"))
    .add("lodash.get", () =>
      lodashGet(config, "auth.providers.0.options.scope"),
    )
    .add("dot-prop", () =>
      getProperty(config, "auth.providers.0.options.scope"),
    )
    .add("native", () => config.auth.providers[0]?.options.scope);
  await deep.run();
  console.log("Deep access (4+ levels):");
  console.table(deep.table());

  // -- Array index access --
  const array = new Bench({ time: 500, warmupTime: 100 });
  array
    .add("ts-safe-path", () => get(config, "db.ports.1"))
    .add("lodash.get", () => lodashGet(config, "db.ports.1"))
    .add("dot-prop", () => getProperty(config, "db.ports.1"))
    .add("native", () => config.db.ports[1]);
  await array.run();
  console.log("Array index access:");
  console.table(array.table());
}

void run();
