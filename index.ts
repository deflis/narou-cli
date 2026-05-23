#!/usr/bin/env bun
import { Command } from "commander";
import * as narou from "narou";

const program = new Command()
  .name("narou")
  .description("なろう小説 API CLI")
  .version("0.1.0");

program
  .command("search")
  .description("小説を検索")
  .argument("[word]", "検索ワード")
  .option("-l, --limit <n>", "取得件数", parseInt)
  .option("-s, --start <n>", "取得開始位置", parseInt)
  .option("--order <order>", "出力順序")
  .option("--genre <code>", "ジャンルコード")
  .option("--big-genre <code>", "大ジャンルコード")
  .option("--ncode <ncode>", "Nコード")
  .option("--user-id <id>", "ユーザID", parseInt)
  .option("--type <type>", "小説タイプ (t/r/er/re/ter)")
  .option("-o, --output <format>", "出力形式 (json/table)", "table")
  .action(async (word, opts) => {
    const builder = narou.search(word);
    if (opts.limit) builder.limit(opts.limit);
    if (opts.start) builder.start(opts.start);
    if (opts.order) builder.order(opts.order);
    if (opts.genre) builder.genre(parseInt(opts.genre));
    if (opts.bigGenre) builder.bigGenre(parseInt(opts.bigGenre));
    if (opts.ncode) builder.ncode(opts.ncode);
    if (opts.userId) builder.userId(opts.userId);
    if (opts.type) builder.type(opts.type as any);
    const result = await builder.execute();
    printSearchResults(result, opts.output);
  });

program
  .command("ranking")
  .description("ランキングを取得")
  .option("--type <type>", "ランキング種別 (daily/weekly/monthly/quarterly)", "daily")
  .option("--date <date>", "集計日 (YYYY-MM-DD)")
  .option("-o, --output <format>", "出力形式 (json/table)", "table")
  .action(async (opts) => {
    const builder = narou.ranking();
    const typeMap: Record<string, "d" | "w" | "m" | "q"> = {
      daily: "d", weekly: "w", monthly: "m", quarterly: "q",
    };
    builder.type(typeMap[opts.type] ?? "d");
    if (opts.date) builder.date(new Date(opts.date));
    const result = await builder.execute();
    printRankingResults(result, opts.output);
  });

program
  .command("rank-history")
  .description("殿堂入りランキング履歴を取得")
  .argument("<ncode>", "Nコード")
  .option("-o, --output <format>", "出力形式 (json/table)", "table")
  .action(async (ncode, opts) => {
    const result = await narou.rankingHistory(ncode);
    printRankingHistory(result, opts.output);
  });

program
  .command("search-user")
  .description("ユーザを検索")
  .argument("[word]", "検索ワード")
  .option("--user-id <id>", "ユーザID", parseInt)
  .option("-l, --limit <n>", "取得件数", parseInt)
  .option("-o, --output <format>", "出力形式 (json/table)", "table")
  .action(async (word, opts) => {
    const builder = narou.searchUser(word);
    if (opts.limit) builder.limit(opts.limit);
    if (opts.userId) builder.userId(opts.userId);
    const result = await builder.execute();
    printUserResults(result, opts.output);
  });

program.parse();

function printSearchResults(result: any, format: string) {
  if (format === "json") {
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

function printRankingResults(result: any[], format: string) {
  if (format === "json") {
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

function printRankingHistory(result: any[], format: string) {
  if (format === "json") {
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

function printUserResults(result: any, format: string) {
  if (format === "json") {
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
