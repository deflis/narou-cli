import { parseArgs } from "util";
import * as narou from "narou";
import packageJson from "../package.json" with { type: "json" };
import { OutputFormats, printRankingHistory, printRankingResults, printSearchResults, printUserResults } from "./output";
import type { OutputFormat } from "./output";
import {
  CliArgumentError,
  outputFields,
  parseBigGenre,
  parseGenre,
  parseLocalDate,
  parseNCode,
  parseNovelType,
  parseNumberOption,
  parseOrder,
  parseOutputFields,
  parseRankingType,
} from "./parsers";
import type { OutputFields, RankingTypeOption } from "./parsers";

const VERSION = packageJson.version;
const SEARCH_DEFAULT_FIELDS = outputFields(["ncode", "title", "writer", "global_point", "length"]);
const RANKING_DEFAULT_FIELDS = outputFields(["rank", "ncode", "pt"]);
const RANKING_HISTORY_DEFAULT_FIELDS = outputFields(["type", "date", "rank", "pt"]);
const USER_DEFAULT_FIELDS = outputFields(["userid", "name", "novel_cnt", "sum_global_point"]);
const RANKING_BASE_FIELDS = new Set(["rank", "ncode", "pt"]);

export async function runCli(args: string[] = Bun.argv.slice(2)): Promise<void> {
  try {
    await run(args);
  } catch (error) {
    if (error instanceof CliArgumentError || isParseArgsError(error)) {
      console.error(`error: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

async function run(args: string[]): Promise<void> {
  const [command, ...commandArgs] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-V") {
    console.log(VERSION);
    return;
  }

  switch (command) {
    case "search":
      await runSearch(commandArgs);
      return;
    case "ranking":
      await runRanking(commandArgs);
      return;
    case "rank-history":
      await runRankHistory(commandArgs);
      return;
    case "search-user":
      await runSearchUser(commandArgs);
      return;
    default:
      throw new CliArgumentError(`Unknown command: ${command}`);
  }
}

async function runSearch(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      limit: { type: "string", short: "l" },
      start: { type: "string", short: "s" },
      order: { type: "string" },
      genre: { type: "string" },
      "big-genre": { type: "string" },
      ncode: { type: "string" },
      "user-id": { type: "string" },
      type: { type: "string" },
      output: { type: "string", short: "o", default: "table" },
      fields: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    printSearchHelp();
    return;
  }

  const format = outputFormat(values.output);
  const fields = values.fields ? parseNovelOutputFields(values.fields) : SEARCH_DEFAULT_FIELDS;
  const builder = narou.search(positionals[0]);
  if (values.limit) builder.limit(parseNumberOption(values.limit, "limit"));
  if (values.start) builder.start(parseNumberOption(values.start, "start"));
  if (values.order) builder.order(parseOrder(values.order));
  if (values.genre) builder.genre(parseGenre(values.genre));
  if (values["big-genre"]) builder.bigGenre(parseBigGenre(values["big-genre"]));
  if (values.ncode) builder.ncode(values.ncode);
  if (values["user-id"]) builder.userId(parseNumberOption(values["user-id"], "user-id"));
  if (values.type) builder.type(parseNovelType(values.type));
  if (values.fields) builder.fields(toNarouFields(fields));

  const result = await builder.execute();
  printSearchResults(result, format, fields);
}

async function runRanking(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      type: { type: "string", default: "daily" },
      date: { type: "string" },
      output: { type: "string", short: "o", default: "table" },
      fields: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    printRankingHelp();
    return;
  }

  const format = outputFormat(values.output);
  const fields = values.fields ? parseRankingOutputFields(values.fields) : RANKING_DEFAULT_FIELDS;
  const builder = narou.ranking();
  builder.type(rankingTypeCode(parseRankingType(values.type)));
  if (values.date) builder.date(parseLocalDate(values.date));

  const detailFields = toRankingDetailFields(fields);
  const result = detailFields.length > 0 ? await builder.executeWithFields(detailFields) : await builder.execute();
  printRankingResults(result, format, fields);
}

async function runRankHistory(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      output: { type: "string", short: "o", default: "table" },
      fields: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    printRankHistoryHelp();
    return;
  }

  const format = outputFormat(values.output);
  const fields = values.fields ? parseRankingHistoryOutputFields(values.fields) : RANKING_HISTORY_DEFAULT_FIELDS;
  const ncode = parseNCode(positionals[0]);

  const result = await narou.rankingHistory(ncode);
  printRankingHistory(result, format, fields);
}

async function runSearchUser(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      "user-id": { type: "string" },
      limit: { type: "string", short: "l" },
      output: { type: "string", short: "o", default: "table" },
      fields: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    printSearchUserHelp();
    return;
  }

  const format = outputFormat(values.output);
  const fields = values.fields ? parseUserOutputFields(values.fields) : USER_DEFAULT_FIELDS;
  const builder = narou.searchUser(positionals[0]);
  if (values.limit) builder.limit(parseNumberOption(values.limit, "limit"));
  if (values["user-id"]) builder.userId(parseNumberOption(values["user-id"], "user-id"));
  if (values.fields) builder.fields(toNarouUserFields(fields));

  const result = await builder.execute();
  printUserResults(result, format, fields);
}

function outputFormat(value: string | boolean | undefined): OutputFormat {
  if (value === undefined || value === "table") {
    return OutputFormats.Table;
  }
  if (value === "json") {
    return OutputFormats.Json;
  }
  throw new CliArgumentError(`Invalid output format: ${value}. Expected json or table.`);
}

function rankingTypeCode(value: RankingTypeOption): "d" | "w" | "m" | "q" {
  switch (value) {
    case "daily":
      return "d";
    case "weekly":
      return "w";
    case "monthly":
      return "m";
    case "quarterly":
      return "q";
  }
  throw new CliArgumentError(`Invalid ranking type: ${value}`);
}

function parseNovelOutputFields(value: string): OutputFields {
  return parseOutputFields(value, Object.keys(narou.Fields));
}

function parseRankingOutputFields(value: string): OutputFields {
  return parseOutputFields(value, ["rank", "pt", ...Object.keys(narou.Fields)]);
}

function parseRankingHistoryOutputFields(value: string): OutputFields {
  return parseOutputFields(value, ["type", "date", "rank", "pt"]);
}

function parseUserOutputFields(value: string): OutputFields {
  return parseOutputFields(value, Object.keys(narou.UserFields));
}

function toNarouFields(fields: readonly string[]): narou.Fields[] {
  return fields.map((field) => narou.Fields[field as keyof typeof narou.Fields]).filter((field) => field !== undefined);
}

function toRankingDetailFields(fields: OutputFields): narou.Fields[] {
  return toNarouFields(fields.filter((field) => !RANKING_BASE_FIELDS.has(field)));
}

function toNarouUserFields(fields: readonly string[]): narou.UserFields[] {
  return fields.map((field) => narou.UserFields[field as keyof typeof narou.UserFields]).filter((field) => field !== undefined);
}

function isParseArgsError(error: unknown): error is Error {
  return error instanceof Error && "code" in error && String(error.code).startsWith("ERR_PARSE_ARGS");
}

function printHelp(): void {
  console.log(`Usage: narou [options] [command]

なろう小説 API CLI

Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  search [options] [word]         小説を検索
  ranking [options]               ランキングを取得
  rank-history [options] <ncode>  殿堂入りランキング履歴を取得
  search-user [options] [word]    ユーザを検索`);
}

function printSearchHelp(): void {
  console.log(`Usage: narou search [options] [word]

小説を検索

Options:
  -l, --limit <n>                 取得件数
  -s, --start <n>                 取得開始位置
  --order <order>                 出力順序
  --genre <code>                  ジャンルコード
  --big-genre <code>              大ジャンルコード
  --ncode <ncode>                 Nコード
  --user-id <id>                  ユーザID
  --type <type>                   小説タイプ (t/r/er/re/ter)
  -o, --output <format>           出力形式 (json/table)
  --fields <fields>               出力フィールド (カンマ区切り)
  -h, --help                      display help for command`);
}

function printRankingHelp(): void {
  console.log(`Usage: narou ranking [options]

ランキングを取得

Options:
  --type <type>                   ランキング種別 (daily/weekly/monthly/quarterly)
  --date <date>                   集計日 (YYYY-MM-DD)
  -o, --output <format>           出力形式 (json/table)
  --fields <fields>               出力フィールド (カンマ区切り)
  -h, --help                      display help for command`);
}

function printRankHistoryHelp(): void {
  console.log(`Usage: narou rank-history [options] <ncode>

殿堂入りランキング履歴を取得

Options:
  -o, --output <format>           出力形式 (json/table)
  --fields <fields>               出力フィールド (カンマ区切り)
  -h, --help                      display help for command`);
}

function printSearchUserHelp(): void {
  console.log(`Usage: narou search-user [options] [word]

ユーザを検索

Options:
  --user-id <id>                  ユーザID
  -l, --limit <n>                 取得件数
  -o, --output <format>           出力形式 (json/table)
  --fields <fields>               出力フィールド (カンマ区切り)
  -h, --help                      display help for command`);
}
