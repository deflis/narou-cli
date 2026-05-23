import type { OutputFields } from "./parsers";

declare const outputFormatBrand: unique symbol;

export type OutputFormat = ("json" | "table") & {
  readonly [outputFormatBrand]: "OutputFormat";
};

export const OutputFormats = {
  Json: "json" as OutputFormat,
  Table: "table" as OutputFormat,
} as const;

type OutputKind = "search" | "ranking" | "rankingHistory" | "user";
type OutputRow = Record<string, unknown>;

export interface OutputMeta {
  totalCount?: number;
  returnedCount: number;
  limit?: number;
  start?: number;
  page?: number;
}

export interface OutputDocument {
  schemaVersion: 1;
  kind: OutputKind;
  fields: string[];
  meta: OutputMeta;
  rows: OutputRow[];
}

export function printSearchResults(result: any, format: OutputFormat, fields: OutputFields) {
  printOutput("search", result.values, format, fields, searchResultMeta(result));
}

export function printRankingResults(result: any[], format: OutputFormat, fields: OutputFields) {
  printOutput("ranking", result, format, fields, rowCountMeta(result));
}

export function printRankingHistory(result: any[], format: OutputFormat, fields: OutputFields) {
  const rows = formatRankingHistoryRows(result);
  printOutput("rankingHistory", rows, format, fields, rowCountMeta(rows));
}

export function printUserResults(result: any, format: OutputFormat, fields: OutputFields) {
  printOutput("user", result.values, format, fields, searchResultMeta(result));
}

function printOutput(kind: OutputKind, rows: any[], format: OutputFormat, fields: OutputFields, meta: OutputMeta): void {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(createOutputDocument(kind, rows, fields, meta), null, 2));
    return;
  }
  console.table([createTableMetaRow(kind, meta)]);
  console.table(selectTableRows(rows, fields));
}

export function createOutputDocument(kind: OutputKind, rows: any[], fields: OutputFields, meta?: Partial<OutputMeta>): OutputDocument {
  return {
    schemaVersion: 1,
    kind,
    fields: [...fields],
    meta: {
      returnedCount: rows.length,
      ...meta,
    },
    rows: selectJsonRows(rows, fields),
  };
}

function searchResultMeta(result: any): OutputMeta {
  return {
    totalCount: result.allcount,
    returnedCount: result.length ?? result.values?.length ?? 0,
    limit: result.limit,
    start: result.start,
    page: result.page,
  };
}

function rowCountMeta(rows: any[]): OutputMeta {
  return {
    returnedCount: rows.length,
  };
}

export function createTableMetaRow(kind: OutputKind, meta: OutputMeta): OutputRow {
  return Object.fromEntries(
    Object.entries({
      kind,
      totalCount: meta.totalCount,
      returnedCount: meta.returnedCount,
      limit: meta.limit,
      start: meta.start,
      page: meta.page,
    }).filter(([, value]) => value !== undefined)
  );
}

function formatRankingHistoryRows(result: any[]): Record<string, unknown>[] {
  return result.map((v: any) => ({
    type: v.type,
    date: v.date?.toISOString().slice(0, 10),
    rank: v.rank,
    pt: v.pt,
  }));
}

function selectJsonRows(rows: any[], fields: OutputFields): OutputRow[] {
  return rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field] ?? null])));
}

function selectTableRows(rows: any[], fields: OutputFields): OutputRow[] {
  return rows.map((row) => Object.fromEntries(fields.map((field) => [field, formatTableValue(row[field])])));
}

function formatTableValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.length > 40 ? value.slice(0, 40) : value;
  }
  return value ?? "-";
}
