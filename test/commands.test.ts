import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

type Call = {
  name: string;
  args: unknown[];
};

const calls: Call[] = [];

const Genre = {
  RenaiIsekai: 101,
};

const BigGenre = {
  Renai: 1,
};

const Order = {
  HyokaDesc: "hyoka",
};

const NovelTypeParam = {
  RensaiEnd: "er",
};

const Fields = {
  title: 1,
  ncode: 2,
  userid: 3,
  writer: 4,
  global_point: 5,
  length: 6,
};

const OptionalFields = {
  weekly_unique: 1,
};

const UserFields = {
  userid: 1,
  name: 2,
  novel_cnt: 3,
  sum_global_point: 4,
};

mock.module("narou", () => ({
  Genre,
  BigGenre,
  Order,
  NovelTypeParam,
  Fields,
  OptionalFields,
  UserFields,
  search: (word?: string) => createSearchBuilder(word),
  ranking: () => createRankingBuilder(),
  rankingHistory: async (ncode: string) => {
    calls.push({ name: "rankingHistory", args: [ncode] });
    return [{ type: "daily", date: new Date(2026, 4, 23), rank: 1, pt: 100 }];
  },
  searchUser: (word?: string) => createSearchUserBuilder(word),
}));

const { runCli } = await import("../src/commands");

describe("runCli", () => {
  let originalLog: typeof console.log;
  let originalError: typeof console.error;
  let originalTable: typeof console.table;
  let logs: string[];
  let errors: string[];
  let tables: unknown[];

  beforeEach(() => {
    calls.length = 0;
    process.exitCode = 0;
    logs = [];
    errors = [];
    tables = [];
    originalLog = console.log;
    originalError = console.error;
    originalTable = console.table;
    console.log = (message?: unknown) => {
      logs.push(String(message));
    };
    console.error = (message?: unknown) => {
      errors.push(String(message));
    };
    console.table = (data?: unknown) => {
      tables.push(data);
    };
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
    console.table = originalTable;
    process.exitCode = 0;
  });

  test("prints top-level help and version", async () => {
    await runCli([]);
    await runCli(["--version"]);

    expect(logs[0]).toContain("Usage: narou");
    expect(logs[1]).toBe("0.1.0");
  });

  test("prints command help without executing builders", async () => {
    await runCli(["search", "--help"]);
    await runCli(["ranking", "--help"]);
    await runCli(["rank-history", "--help"]);
    await runCli(["search-user", "--help"]);

    expect(logs).toEqual([
      expect.stringContaining("Usage: narou search"),
      expect.stringContaining("Usage: narou ranking"),
      expect.stringContaining("Usage: narou rank-history"),
      expect.stringContaining("Usage: narou search-user"),
    ]);
    expect(calls).toEqual([]);
  });

  test("reports unknown commands and argument errors", async () => {
    await runCli(["unknown"]);
    await runCli(["search", "--output", "xml"]);
    await runCli(["search", "--bad-option"]);

    expect(process.exitCode).toBe(1);
    expect(errors).toEqual([
      "error: Unknown command: unknown",
      "error: Invalid output format: xml. Expected json or table.",
      expect.stringContaining("Unknown option"),
    ]);
  });

  test("runs search with filters and JSON output", async () => {
    await runCli([
      "search",
      "keyword",
      "--limit",
      "2",
      "--start",
      "3",
      "--order",
      "hyoka",
      "--genre",
      "101",
      "--big-genre",
      "1",
      "--ncode",
      "N0001",
      "--user-id",
      "123",
      "--type",
      "er",
      "--output",
      "json",
      "--fields",
      "ncode,title,weekly_unique",
    ]);

    expect(calls).toEqual([
      { name: "search", args: ["keyword"] },
      { name: "search.limit", args: [2] },
      { name: "search.start", args: [3] },
      { name: "search.order", args: ["hyoka"] },
      { name: "search.genre", args: [101] },
      { name: "search.bigGenre", args: [1] },
      { name: "search.ncode", args: ["N0001"] },
      { name: "search.userId", args: [123] },
      { name: "search.type", args: ["er"] },
      { name: "search.fields", args: [[2, 1]] },
      { name: "search.opt", args: [[1]] },
      { name: "search.execute", args: [] },
    ]);
    expect(JSON.parse(logs[0] ?? "")).toMatchObject({
      kind: "search",
      fields: ["ncode", "title", "weekly_unique"],
      rows: [{ ncode: "N0001", title: "title 1", weekly_unique: 10 }],
    });
  });

  test("runs ranking with detailed fields", async () => {
    await runCli([
      "ranking",
      "--type",
      "weekly",
      "--date",
      "2026-05-23",
      "--output",
      "json",
      "--fields",
      "rank,ncode,title,weekly_unique",
    ]);

    expect(calls).toEqual([
      { name: "ranking", args: [] },
      { name: "ranking.type", args: ["w"] },
      { name: "ranking.date", args: [expect.any(Date)] },
      { name: "ranking.executeWithFields", args: [[1], [1]] },
    ]);
    expect(JSON.parse(logs[0] ?? "")).toMatchObject({
      kind: "ranking",
      rows: [{ rank: 1, ncode: "N0001", title: "title 1", weekly_unique: 10 }],
    });
  });

  test("maps monthly and quarterly ranking types", async () => {
    await runCli(["ranking", "--type", "monthly"]);
    await runCli(["ranking", "--type", "quarterly"]);

    expect(calls.map((call) => call.name === "ranking.type" && call.args[0]).filter(Boolean)).toEqual(["m", "q"]);
  });

  test("runs ranking with default table output", async () => {
    await runCli(["ranking"]);

    expect(calls).toEqual([
      { name: "ranking", args: [] },
      { name: "ranking.type", args: ["d"] },
      { name: "ranking.execute", args: [] },
    ]);
    expect(tables[0]).toEqual([{ kind: "ranking", returnedCount: 1 }]);
    expect(tables[1]).toEqual([{ rank: 1, ncode: "N0001", pt: 100 }]);
  });

  test("runs rank-history with JSON output", async () => {
    await runCli(["rank-history", "N0001", "--output", "json"]);

    expect(calls).toEqual([{ name: "rankingHistory", args: ["N0001"] }]);
    expect(JSON.parse(logs[0] ?? "")).toMatchObject({
      kind: "rankingHistory",
      rows: [{ type: "daily", date: "2026-05-23", rank: 1, pt: 100 }],
    });
  });

  test("requires ncode for rank-history", async () => {
    await runCli(["rank-history"]);

    expect(process.exitCode).toBe(1);
    expect(errors).toEqual(["error: Missing required argument: ncode"]);
  });

  test("runs search-user with fields and JSON output", async () => {
    await runCli([
      "search-user",
      "writer",
      "--user-id",
      "123",
      "--limit",
      "1",
      "--output",
      "json",
      "--fields",
      "userid,name",
    ]);

    expect(calls).toEqual([
      { name: "searchUser", args: ["writer"] },
      { name: "searchUser.limit", args: [1] },
      { name: "searchUser.userId", args: [123] },
      { name: "searchUser.fields", args: [[1, 2]] },
      { name: "searchUser.execute", args: [] },
    ]);
    expect(JSON.parse(logs[0] ?? "")).toMatchObject({
      kind: "user",
      rows: [{ userid: 123, name: "user 1" }],
    });
  });

  test("rethrows unexpected errors", async () => {
    await expect(runCli(["search", "explode"])).rejects.toThrow("unexpected failure");
  });
});

function createSearchBuilder(word?: string) {
  calls.push({ name: "search", args: [word] });
  if (word === "explode") {
    return createBuilder("search", new Error("unexpected failure"));
  }
  return createBuilder("search", {
    allcount: 1,
    length: 1,
    limit: 2,
    start: 3,
    page: 1,
    values: [{ ncode: "N0001", title: "title 1", weekly_unique: 10 }],
  });
}

function createRankingBuilder() {
  calls.push({ name: "ranking", args: [] });
  return {
    type: record("ranking.type"),
    date: record("ranking.date"),
    execute: async () => {
      calls.push({ name: "ranking.execute", args: [] });
      return [{ rank: 1, ncode: "N0001", pt: 100 }];
    },
    executeWithFields: async (...args: unknown[]) => {
      calls.push({ name: "ranking.executeWithFields", args });
      return [{ rank: 1, ncode: "N0001", title: "title 1", weekly_unique: 10 }];
    },
  };
}

function createSearchUserBuilder(word?: string) {
  calls.push({ name: "searchUser", args: [word] });
  return createBuilder("searchUser", {
    allcount: 1,
    values: [{ userid: 123, name: "user 1" }],
  });
}

function createBuilder(name: string, result: unknown) {
  return {
    limit: record(`${name}.limit`),
    start: record(`${name}.start`),
    order: record(`${name}.order`),
    genre: record(`${name}.genre`),
    bigGenre: record(`${name}.bigGenre`),
    ncode: record(`${name}.ncode`),
    userId: record(`${name}.userId`),
    type: record(`${name}.type`),
    fields: record(`${name}.fields`),
    opt: record(`${name}.opt`),
    execute: async () => {
      calls.push({ name: `${name}.execute`, args: [] });
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  };
}

function record(name: string) {
  return (...args: unknown[]) => {
    calls.push({ name, args });
  };
}
