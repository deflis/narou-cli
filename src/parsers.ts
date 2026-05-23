import * as narou from "narou";

type NumberEnumLike = Record<string, number>;
type StringEnumLike = Record<string, string>;
declare const validatedBrand: unique symbol;

type Brand<T, TName extends string> = T & {
  readonly [validatedBrand]: TName;
};

export type IntegerOption = Brand<number, "IntegerOption">;
export type LocalDate = Brand<Date, "LocalDate">;
export type NCode = Brand<string, "NCode">;
export type OutputField = Brand<string, "OutputField">;
export type OutputFields = Brand<readonly OutputField[], "OutputFields">;
export type RankingTypeOption = Brand<"daily" | "weekly" | "monthly" | "quarterly", "RankingTypeOption">;

export class CliArgumentError extends Error {}

export function parseGenre(value: string): narou.Genre {
  return parseEnumValue(value, narou.Genre, "genre") as narou.Genre;
}

export function parseBigGenre(value: string): narou.BigGenre {
  return parseEnumValue(value, narou.BigGenre, "big-genre") as narou.BigGenre;
}

export function parseLocalDate(value: string): LocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new CliArgumentError(`Invalid date: ${value}. Expected YYYY-MM-DD.`);
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    throw new CliArgumentError(`Invalid date: ${value}.`);
  }
  return date as LocalDate;
}

export function parseNumberOption(value: string, name: string): IntegerOption {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new CliArgumentError(`Invalid ${name}: ${value}`);
  }
  return parsed as IntegerOption;
}

export function parseNCode(value: string | undefined): NCode {
  if (!value) {
    throw new CliArgumentError("Missing required argument: ncode");
  }
  return value as NCode;
}

export function parseOrder(value: string): narou.Order {
  return parseStringEnumValue(value, narou.Order, "order") as narou.Order;
}

export function parseNovelType(value: string): narou.NovelTypeParam {
  return parseStringEnumValue(value, narou.NovelTypeParam, "type") as narou.NovelTypeParam;
}

export function parseRankingType(value: string | undefined): RankingTypeOption {
  const normalized = value ?? "daily";
  switch (normalized) {
    case "daily":
    case "weekly":
    case "monthly":
    case "quarterly":
      return normalized as RankingTypeOption;
    default:
      throw new CliArgumentError(`Invalid ranking type: ${normalized}`);
  }
}

export function parseOutputFields(value: string, allowedFields: readonly string[]): OutputFields {
  const fields = value.split(",").map((field) => field.trim()).filter((field) => field.length > 0);
  if (fields.length === 0) {
    throw new CliArgumentError("Invalid fields: empty field list");
  }

  const allowed = new Set(allowedFields);
  const invalid = fields.filter((field) => !allowed.has(field));
  if (invalid.length > 0) {
    throw new CliArgumentError(`Invalid fields: ${invalid.join(", ")}`);
  }

  return fields as unknown as OutputFields;
}

export function outputFields(fields: readonly string[]): OutputFields {
  return fields as unknown as OutputFields;
}

function parseEnumValue(value: string, values: NumberEnumLike, name: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || !Object.values(values).includes(parsed)) {
    throw new CliArgumentError(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function parseStringEnumValue(value: string, values: StringEnumLike, name: string): string {
  if (!Object.values(values).includes(value)) {
    throw new CliArgumentError(`Invalid ${name}: ${value}`);
  }
  return value;
}
