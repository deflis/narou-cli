import { describe, expect, test } from "bun:test";
import {
  OutputFormats,
  createOutputDocument,
  createTableMetaRow,
  printRankingHistory,
  printRankingResults,
  printSearchResults,
  printUserResults,
} from "../src/output";
import { outputFields } from "../src/parsers";

describe("createOutputDocument", () => {
  test("selected fields and metadata are emitted for analysis", () => {
    const document = createOutputDocument(
      "search",
      [
        { ncode: "N0001", title: "title 1", global_point: 100, ignored: "x" },
        { ncode: "N0002", title: "title 2" },
      ],
      outputFields(["ncode", "title", "global_point"]),
      { totalCount: 10, limit: 2, start: 1, page: 0 }
    );

    expect(document).toEqual({
      schemaVersion: 1,
      kind: "search",
      fields: ["ncode", "title", "global_point"],
      meta: {
        totalCount: 10,
        returnedCount: 2,
        limit: 2,
        start: 1,
        page: 0,
      },
      rows: [
        { ncode: "N0001", title: "title 1", global_point: 100 },
        { ncode: "N0002", title: "title 2", global_point: null },
      ],
    });
  });
});

describe("createTableMetaRow", () => {
  test("keeps table metadata compact and omits missing values", () => {
    expect(createTableMetaRow("ranking", { returnedCount: 20 })).toEqual({
      kind: "ranking",
      returnedCount: 20,
    });
  });

  test("includes total count and paging information when available", () => {
    expect(
      createTableMetaRow("search", {
        totalCount: 100,
        returnedCount: 10,
        limit: 10,
        start: 1,
        page: 0,
      })
    ).toEqual({
      kind: "search",
      totalCount: 100,
      returnedCount: 10,
      limit: 10,
      start: 1,
      page: 0,
    });
  });
});

describe("printSearchResults", () => {
  test("prints a JSON document with search metadata", () => {
    const logs = withConsoleLog(() => {
      printSearchResults(
        {
          allcount: 5,
          length: 1,
          limit: 1,
          start: 2,
          page: 1,
          values: [{ ncode: "N0001", title: "title 1" }],
        },
        OutputFormats.Json,
        outputFields(["ncode", "title"])
      );
    });

    expect(JSON.parse(logs[0] ?? "")).toEqual({
      schemaVersion: 1,
      kind: "search",
      fields: ["ncode", "title"],
      meta: {
        totalCount: 5,
        returnedCount: 1,
        limit: 1,
        start: 2,
        page: 1,
      },
      rows: [{ ncode: "N0001", title: "title 1" }],
    });
  });
});

describe("printRankingResults", () => {
  test("prints compact table rows", () => {
    const tables = withConsoleTable(() => {
      printRankingResults(
        [
          {
            ncode: "N0001",
            title: "12345678901234567890123456789012345678901",
            writer: null,
          },
        ],
        OutputFormats.Table,
        outputFields(["ncode", "title", "writer", "missing"])
      );
    });

    expect(tables).toEqual([
      [{ kind: "ranking", returnedCount: 1 }],
      [
        {
          ncode: "N0001",
          title: "1234567890123456789012345678901234567890",
          writer: "-",
          missing: "-",
        },
      ],
    ]);
  });
});

describe("printRankingHistory", () => {
  test("formats ranking history dates for JSON output", () => {
    const logs = withConsoleLog(() => {
      printRankingHistory(
        [{ type: "daily", date: new Date(2026, 4, 23), rank: 1, pt: 100 }],
        OutputFormats.Json,
        outputFields(["type", "date", "rank", "pt"])
      );
    });

    expect(JSON.parse(logs[0] ?? "")).toMatchObject({
      kind: "rankingHistory",
      rows: [{ type: "daily", date: "2026-05-23", rank: 1, pt: 100 }],
    });
  });
});

describe("printUserResults", () => {
  test("uses values length when result length is unavailable", () => {
    const logs = withConsoleLog(() => {
      printUserResults(
        {
          allcount: 2,
          limit: 1,
          start: 1,
          page: 0,
          values: [{ userid: 123, name: "user 1" }],
        },
        OutputFormats.Json,
        outputFields(["userid", "name"])
      );
    });

    expect(JSON.parse(logs[0] ?? "").meta.returnedCount).toBe(1);
  });
});

function withConsoleLog(callback: () => void): string[] {
  const originalLog = console.log;
  const logs: string[] = [];
  console.log = (message?: unknown) => {
    logs.push(String(message));
  };
  try {
    callback();
  } finally {
    console.log = originalLog;
  }
  return logs;
}

function withConsoleTable(callback: () => void): unknown[] {
  const originalTable = console.table;
  const tables: unknown[] = [];
  console.table = (data?: unknown) => {
    tables.push(data);
  };
  try {
    callback();
  } finally {
    console.table = originalTable;
  }
  return tables;
}
