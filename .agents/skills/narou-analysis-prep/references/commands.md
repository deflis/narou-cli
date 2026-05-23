# Commands

Run from the directory where dataset files should be created.

## Search Corpus Page

```bash
mkdir -p data/raw/search
narou search 異世界 \
  --order weekly \
  -l 100 \
  -s 1 \
  --fields ncode,title,userid,writer,biggenre,genre,keyword,general_firstup,general_lastup,noveltype,end,length,time,global_point,weekly_point,fav_novel_cnt,review_cnt,updated_at \
  -o json > data/raw/search/isekai-weekly-start-000001.json
```

## Search Pagination Template

```bash
mkdir -p data/raw/search
for start in 1 101 201 301 401; do
  narou search 異世界 \
    --order weekly \
    -l 100 \
    -s "$start" \
    --fields ncode,title,userid,writer,biggenre,genre,general_firstup,general_lastup,length,global_point,weekly_point,fav_novel_cnt,review_cnt,updated_at \
    -o json > "data/raw/search/isekai-weekly-start-$(printf '%06d' "$start").json"
done
```

Inspect `.meta.totalCount` and stop after the collected pages cover the total.

## Ranking Snapshot

```bash
mkdir -p data/raw/ranking
narou ranking \
  --type daily \
  --date 2026-05-23 \
  --fields rank,ncode,pt,title,userid,writer,biggenre,genre,global_point,fav_novel_cnt,updated_at \
  -o json > data/raw/ranking/daily-2026-05-23.json
```

## Ranking History

```bash
mkdir -p data/raw/rank-history
narou rank-history N0000XX \
  --fields type,date,rank,pt \
  -o json > data/raw/rank-history/N0000XX.json
```

## User Lookup

```bash
mkdir -p data/raw/user
narou search-user --user-id 12345 \
  --fields userid,name,novel_cnt,review_cnt,novel_length,sum_global_point \
  -o json > data/raw/user/user-12345.json
```

## JSONL Derivation

```bash
mkdir -p data/derived
jq -c '.rows[]' data/raw/search/isekai-weekly-start-000001.json > data/derived/isekai-weekly.jsonl
```

## CSV Derivation

```bash
mkdir -p data/derived
jq -r '.fields as $fields | ($fields), (.rows[] | [.[$fields[]]]) | @csv' \
  data/raw/search/isekai-weekly-start-000001.json > data/derived/isekai-weekly.csv
```

## Minimal Manifest Template

```json
{
  "dataset": "example",
  "created_at": "2026-05-23",
  "source": "narou CLI",
  "commands": [],
  "raw_files": [],
  "derived_files": [],
  "fields": [],
  "row_counts": {}
}
```
