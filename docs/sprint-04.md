# Sprint 04 — Search, History, Pull AI

## Goal
Complete Velvet's "remember when needed" experience without pushing advice to the user.

## Scope
- unified Search surface
- person, visit, gift, knowledge, relationship and schedule retrieval
- recent searches and quick chips
- person timeline/history
- co-visit retrieval
- Free rolling-one-year visibility enforcement
- Pro full-history visibility
- user-triggered natural-language search through AI Platform Core
- graceful fallback from AI search to normal search

## Search modes
### Standard search
Default and free of AI cost. Search names, nicknames, contact identifiers, knowledge labels/values, gift names and structured visit metadata.

### Quick chips
Examples: favorite drink, hobby, occupation, gift, payment, visit context, recent visit. Chips reduce typing and combine with text search.

### Pull AI search
Explicitly invoked by the user for queries such as:
- 去年財布をあげた人
- ゴルフ好きの人
- 山田さんと一緒に来たことがある人
- 響が好きな人
- 接待で来ることが多い人

AI may interpret intent, but Velvet performs authorized retrieval against the user's scoped data. AI must not receive a full raw customer database unless strictly necessary and explicitly permitted by contract.

## History
Person detail shows a single chronological timeline composed from Visit, Gift, Knowledge updates, Relationship events and Schedule items where useful. Avoid many tabs.

## Free/Pro rules
Free users can search and view only records inside the rolling one-year accessible window, while older retained records remain archived. Pro can access the full retained history.

## Acceptance criteria
- common exact search returns results without AI
- quick chips work without keyboard
- AI search is user-triggered and point-metered
- AI search failure never blocks normal search
- person history is chronological and mobile-friendly
- old Free records are not destructively deleted merely because they are hidden
- all results are scoped to the authenticated owner
