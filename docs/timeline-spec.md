# Timeline Specification v1.0

## Goal
Let the user recall a person's history without navigating many tabs.

## Included item types
- Visit
- Gift received/given
- Knowledge added/changed
- Relationship added/changed
- Schedule event when relevant
- Capture-derived confirmed updates

## Ordering
Newest first by default. Allow a simple oldest/newest toggle later if needed; not required for MVP.

## Card content
Each timeline item should show only what matters:
- date/time
- icon/type
- short summary
- optional amount/payment/context
- optional related person(s)

Do not dump raw JSON or long notes into the stream. Drill-down can reveal details.

## Visit summary examples
- 8/10 21:14–23:42 · 2h28m · ¥85,000 · Card
- 8/02 22:03–? · 接待 · 売上未入力

## Gift examples
- 7/20 · もらった · お土産
- 6/12 · あげた · 財布 · ¥30,000

## Knowledge examples
- 趣味: ゴルフ
- 好きなお酒: 響
- 予定: 大阪出張

## Free visibility
If an item is older than the Free accessible window, it must not render content/snippets. The UI may show a generic archived boundary message without leaking private details.

## Performance
Timeline is paginated/cursor-based. Do not load complete multi-year history on initial render.
