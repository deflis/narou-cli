import type { OutputFields } from "./parsers";

declare const outputFormatBrand: unique symbol;

export type OutputFormat = ("json" | "table") & {
  readonly [outputFormatBrand]: "OutputFormat";
};

export const OutputFormats = {
  Json: "json" as OutputFormat,
  Table: "table" as OutputFormat,
} as const;

export function printSearchResults(result: any, format: OutputFormat, fields: OutputFields) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(selectFields(result.values, fields), null, 2));
    return;
  }
  console.table(selectFields(result.values, fields));
}

export function printRankingResults(result: any[], format: OutputFormat, fields: OutputFields) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(selectFields(result, fields), null, 2));
    return;
  }
  console.table(selectFields(result, fields));
}

export function printRankingHistory(result: any[], format: OutputFormat, fields: OutputFields) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(selectFields(formatRankingHistoryRows(result), fields), null, 2));
    return;
  }
  console.table(selectFields(formatRankingHistoryRows(result), fields));
}

export function printUserResults(result: any, format: OutputFormat, fields: OutputFields) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(selectFields(result.values, fields), null, 2));
    return;
  }
  console.table(selectFields(result.values, fields));
}

function formatRankingHistoryRows(result: any[]): Record<string, unknown>[] {
  return result.map((v: any) => ({
    type: v.type,
    date: v.date?.toISOString().slice(0, 10),
    rank: v.rank,
    pt: v.pt,
  }));
}

function selectFields(rows: any[], fields: OutputFields): Record<string, unknown>[] {
  return rows.map((row) => Object.fromEntries(fields.map((field) => [field, formatValue(row[field])])));
}

function formatValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.length > 40 ? value.slice(0, 40) : value;
  }
  return value ?? "-";
}
