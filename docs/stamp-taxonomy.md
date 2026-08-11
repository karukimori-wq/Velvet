# Velvet Stamp Taxonomy v0.1

## Goal
Provide stable semantic categories while allowing UI labels/icons and user-level values to evolve.

## Core categories
- `drink`
- `bottle`
- `gift_received`
- `gift_given`
- `work`
- `hobby`
- `food`
- `travel`
- `schedule`
- `pet`
- `relationship_context`
- `payment_method`
- `visit_context`
- `nomination`
- `accompaniment`
- `after_hours`
- `memo`
- `other`

## Rules
1. Category identifiers are stable API/domain identifiers.
2. User-facing Japanese labels may vary by supported night-work genre.
3. Stamps are shortcuts, not a closed ontology; `other` and custom values must remain available.
4. User-defined values live in the personal dictionary rather than creating new category identifiers by default.
5. Person-specific ordering may differ from global ordering.
6. A stamp selection must not trigger AI if the semantic result is deterministic.
7. AI is reserved for ambiguous text/voice interpretation or explicit advanced organization.

## Suggested default values
Examples only; defaults must be editable and not exhaustive.

### payment_method
- 現金
- カード
- QR/決済アプリ
- 売掛
- その他

### visit_context
- 一人
- 友人
- 仕事
- 接待
- 同伴
- 団体
- その他

### relationship_context
- 友人
- 同僚
- 上司
- 部下
- 取引先
- 家族
- パートナー
- 紹介
- その他

## Learning
Confirmed usage updates ranking metadata. Suggested ranking uses person-specific frequency/recency before user-global frequency/recency, then app defaults.
