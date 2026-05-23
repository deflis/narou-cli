declare const outputFormatBrand: unique symbol;

export type OutputFormat = ("json" | "table") & {
  readonly [outputFormatBrand]: "OutputFormat";
};

export const OutputFormats = {
  Json: "json" as OutputFormat,
  Table: "table" as OutputFormat,
} as const;

export function printSearchResults(result: any, format: OutputFormat) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(result.values, null, 2));
    return;
  }
  const rows = result.values.map((v: any) => ({
    ncode: v.ncode,
    title: v.title?.slice(0, 40),
    writer: v.writer,
    point: v.global_point ?? "-",
    length: v.length ?? "-",
  }));
  console.table(rows);
}

export function printRankingResults(result: any[], format: OutputFormat) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const rows = result.map((v, i) => ({
    rank: i + 1,
    ncode: v.ncode,
    title: v.title?.slice(0, 40) ?? "-",
    point: v.pt ?? v.global_point ?? "-",
  }));
  console.table(rows);
}

export function printRankingHistory(result: any[], format: OutputFormat) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const rows = result.map((v: any) => ({
    type: v.type,
    date: v.date?.toISOString().slice(0, 10),
    rank: v.rank,
    pt: v.pt,
  }));
  console.table(rows);
}

export function printUserResults(result: any, format: OutputFormat) {
  if (format === OutputFormats.Json) {
    console.log(JSON.stringify(result.values, null, 2));
    return;
  }
  const rows = result.values.map((v: any) => ({
    id: v.userid,
    name: v.name,
    novels: v.novel_cnt ?? "-",
    points: v.sum_global_point ?? "-",
  }));
  console.table(rows);
}
