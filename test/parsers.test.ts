import { describe, expect, test } from "bun:test";
import * as narou from "narou";
import {
  CliArgumentError,
  parseBigGenre,
  parseGenre,
  parseLocalDate,
  parseNCode,
  parseNovelType,
  parseNumberOption,
  parseOrder,
  parseOutputFields,
  parseRankingType,
} from "../src/parsers";

describe("parseLocalDate", () => {
  test("parses YYYY-MM-DD as a local date", () => {
    const date = parseLocalDate("2026-05-23");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(23);
  });

  test("rejects invalid calendar dates", () => {
    expect(() => parseLocalDate("2026-02-30")).toThrow(CliArgumentError);
  });

  test("rejects invalid date formats", () => {
    expect(() => parseLocalDate("2026/05/23")).toThrow(CliArgumentError);
  });
});

describe("parseRankingType", () => {
  test("defaults to daily", () => {
    expect(String(parseRankingType(undefined))).toBe("daily");
  });

  test("accepts supported ranking types", () => {
    expect(String(parseRankingType("weekly"))).toBe("weekly");
    expect(String(parseRankingType("monthly"))).toBe("monthly");
    expect(String(parseRankingType("quarterly"))).toBe("quarterly");
  });

  test("rejects unknown ranking types", () => {
    expect(() => parseRankingType("yearly")).toThrow(CliArgumentError);
  });
});

describe("parseOutputFields", () => {
  test("accepts comma separated allowed fields", () => {
    expect([...parseOutputFields("ncode, title", ["ncode", "title"])] as string[]).toEqual(["ncode", "title"]);
  });

  test("rejects unknown fields", () => {
    expect(() => parseOutputFields("ncode,bogus", ["ncode"])).toThrow(CliArgumentError);
  });

  test("rejects empty field lists", () => {
    expect(() => parseOutputFields(" , ", ["ncode"])).toThrow(CliArgumentError);
  });
});

describe("narou enum parsers", () => {
  test("accept numeric genre values", () => {
    expect(parseGenre("101")).toBe(narou.Genre.RenaiIsekai);
    expect(parseBigGenre("1")).toBe(narou.BigGenre.Renai);
  });

  test("reject invalid numeric enum values", () => {
    expect(() => parseGenre("not-a-number")).toThrow(CliArgumentError);
    expect(() => parseBigGenre("12345")).toThrow(CliArgumentError);
  });

  test("accept string enum values", () => {
    expect(parseOrder("hyoka")).toBe(narou.Order.HyokaDesc);
    expect(parseNovelType("er")).toBe(narou.NovelTypeParam.RensaiEnd);
  });

  test("reject invalid string enum values", () => {
    expect(() => parseOrder("invalid")).toThrow(CliArgumentError);
    expect(() => parseNovelType("invalid")).toThrow(CliArgumentError);
  });
});

describe("argument parsers", () => {
  test("accepts integer options", () => {
    expect(Number(parseNumberOption("10", "limit"))).toBe(10);
  });

  test("rejects non-integer options", () => {
    expect(() => parseNumberOption("1.5", "limit")).toThrow(CliArgumentError);
  });

  test("requires ncode", () => {
    expect(String(parseNCode("N0001"))).toBe("N0001");
    expect(() => parseNCode(undefined)).toThrow(CliArgumentError);
  });
});
