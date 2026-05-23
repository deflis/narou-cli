---
name: narou-analysis-prep
description: Use this skill when preparing 小説家になろう novel data for later analysis with the narou CLI command. Trigger for tasks that need reproducible data acquisition, JSON output, field selection, pagination, raw-data preservation, normalization to analysis-ready files, or dataset handoff preparation. Do not perform interpretation, modeling, ranking commentary, or analytical conclusions with this skill.
---

# Narou Analysis Prep

## Scope

Prepare data for analysis. Stop at clean, documented, analysis-ready datasets.

Do:

- Use the `narou` command.
- Collect `search`, `ranking`, `rank-history`, and `search-user` data as JSON.
- Choose fields, page through results, preserve raw files, and derive tabular files.
- Record enough command metadata for another user to reproduce the dataset.

Do not:

- Interpret trends or rankings.
- Judge作品の内容, popularity, quality, or author behavior.
- Create models, charts, dashboards, or conclusions unless the user asks outside this skill.

## Workflow

1. Work from the directory where dataset files should be created.
2. Create dataset directories:

```bash
mkdir -p data/raw data/derived data/manifests
```

3. Use `narou ... -o json` for raw acquisition. Avoid table output except for quick previews.
4. Always specify `--fields` for datasets that will be reused.
5. Save raw command output unchanged under `data/raw/`.
6. Convert raw JSON into JSONL/CSV/SQLite/Parquet only as derived artifacts.
7. Write a small manifest that records command, date range, filters, fields, file paths, and row counts.

## Command Selection

- Use `search` for a novel corpus by keyword, genre, big genre, N-code, user ID, order, or novel type.
- Use `ranking` for dated ranking snapshots.
- Use `rank-history` for known N-code ranking history.
- Use `search-user` for author/user lookup tables.

Read [references/commands.md](references/commands.md) for copyable acquisition patterns.
Read [references/fields.md](references/fields.md) before choosing `--fields`.

## Raw JSON Contract

Each JSON output is a document:

```json
{
  "schemaVersion": 1,
  "kind": "search",
  "fields": ["ncode", "title"],
  "meta": { "returnedCount": 1 },
  "rows": [{ "ncode": "N0000XX", "title": "..." }]
}
```

Preserve the full document. Do not discard `schemaVersion`, `kind`, `fields`, or `meta`; they are part of dataset provenance.

## Dataset Hygiene

- Include join keys: `ncode` for novel/ranking data and `userid` for user data.
- Include collection date in file names when querying time-sensitive rankings.
- Use absolute dates (`YYYY-MM-DD`) in commands and manifests.
- Keep raw and derived files separate.
- Validate JSON before handing off data:

```bash
jq '.schemaVersion, .kind, .fields, .meta, (.rows | length)' data/raw/example.json
```

- Check requested fields are present in `.fields`.
- Check `(.rows | length)` matches `.meta.returnedCount`.
- Check required join keys are not all null.
