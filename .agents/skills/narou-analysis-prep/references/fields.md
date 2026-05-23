# Fields

Use these names with `--fields` exactly as written.

## Novel Search And Ranking Detail Fields

Identifiers and text:

- `ncode`
- `title`
- `userid`
- `writer`
- `story`
- `keyword`

Genre and publication metadata:

- `biggenre`
- `genre`
- `general_firstup`
- `general_lastup`
- `noveltype`
- `end`
- `general_all_no`
- `length`
- `time`
- `isstop`

Content flags:

- `isr15`
- `isbl`
- `isgl`
- `iszankoku`
- `istensei`
- `istenni`

Scores and counts:

- `global_point`
- `daily_point`
- `weekly_point`
- `monthly_point`
- `quarter_point`
- `yearly_point`
- `fav_novel_cnt`
- `impression_cnt`
- `review_cnt`
- `all_point`
- `all_hyoka_cnt`
- `sasie_cnt`
- `kaiwaritu`

Update timestamps:

- `novelupdated_at`
- `updated_at`

Optional:

- `weekly_unique`

Ranking base fields:

- `rank`
- `pt`

Ranking detail can also include novel fields above.

## Ranking History Fields

- `type`
- `date`
- `rank`
- `pt`

## User Fields

- `userid`
- `name`
- `yomikata`
- `name1st`
- `novel_cnt`
- `review_cnt`
- `novel_length`
- `sum_global_point`

## Common Filter Values

Ranking type:

- `daily`
- `weekly`
- `monthly`
- `quarterly`

Big genre codes:

- `1`: 恋愛
- `2`: ファンタジー
- `3`: 文芸
- `4`: SF
- `99`: その他
- `98`: ノンジャンル

Novel type codes:

- `t`: 短編
- `r`: 連載中
- `er`: 完結済連載
- `re`: すべての連載
- `ter`: 短編と完結済連載

Search order values:

- `favnovelcnt`
- `reviewcnt`
- `hyoka`
- `hyokaasc`
- `impressioncnt`
- `hyokacnt`
- `hyokacntasc`
- `weekly`
- `lengthdesc`
- `lengthasc`
- `ncodedesc`
- `new`
- `old`
- `dailypoint`
- `weeklypoint`
- `monthlypoint`
- `quarterpoint`
- `yearlypoint`
- `generalfirstup`
