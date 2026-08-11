# Search Interaction Specification v1.0

## Principle
Search is a user-controlled recall tool, not a feed of unsolicited recommendations.

## Entry
Search is always reachable from primary navigation and should focus the search field only after the user taps it. Do not automatically open the keyboard on every app launch.

## Result ranking
Prefer in order:
1. exact person/name/contact match
2. person-specific knowledge/value match
3. recent/repeated matches for the same user
4. structured Visit/Gift/Relationship/Schedule matches
5. fuzzy text matches

AI is not required for this ranking.

## Quick chips
Show compact, learned chips such as:
- ゴルフ
- 社長
- 響
- Gift
- 接待
- カード

Chips are user-specific and should favor recent/frequent values. Tapping a chip applies it immediately. Multiple chips may combine using AND semantics by default.

## Natural-language mode
Provide an explicit action such as `文章で探す` or equivalent. Only then invoke the AI capability.

Flow:
1. user enters query
2. Velvet sends minimum query/context references to AI Platform Core
3. AI returns a structured search intent, not authoritative business data
4. Velvet validates the intent and runs scoped database queries locally/server-side
5. results are shown with the matched evidence/category

Example structured intent:
```json
{
  "entity": "person",
  "filters": [
    {"field":"knowledge.category","op":"eq","value":"hobby"},
    {"field":"knowledge.value","op":"contains","value":"ゴルフ"}
  ],
  "timeRange": null
}
```

## Evidence
Where practical, show why an item matched: e.g. `趣味: ゴルフ`, `2026-05-10 Gift: 財布`, or `山田さんと3回来店`.

## Timeline
Person timeline is one chronological stream. Each item has type, timestamp/date, short summary, optional amount/metadata and drill-down. Keep cards compact.

## Privacy and scope
Every query is owner-scoped. Search must never cross `ownerUserId`/workspace boundaries. Hidden Free-history records must not leak through counts, snippets, AI answers or autocomplete.

## Failure behavior
If AI interpretation fails, preserve the typed query and offer normal text search. Never require retyping.
