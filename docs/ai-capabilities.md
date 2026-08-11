# Velvet AI Capabilities v0.1

## Principle

Velvet is not an AI-first user experience. AI Platform Core is used as background infrastructure for user-triggered convenience.

AI must not become the source of truth for Velvet business data. Velvet owns the records; AI returns candidates, structured interpretations, or retrieval assistance.

## Capability: Capture Structure

Purpose: convert user-provided Capture text/voice transcript into structured candidate updates.

Suggested capability name:

`velvet.capture.structure.v1`

Velvet sends only the minimum scoped context necessary, such as:

```json
{
  "workspaceId": "ws_xxx",
  "userId": "usr_xxx",
  "sourceApp": "velvet",
  "capability": "velvet.capture.structure.v1",
  "inputRef": "capture_xxx",
  "context": {
    "personRef": "person_xxx",
    "visitRef": "visit_xxx"
  }
}
```

The raw text/transcript may be provided only when the user explicitly triggered organization and only as needed for the capability.

Expected result is a candidate structure, not committed records.

Example result:

```json
{
  "status": "success",
  "candidates": [
    {
      "type": "knowledge",
      "category": "favorite_drink",
      "value": "響"
    },
    {
      "type": "schedule",
      "subject": "大阪出張",
      "dateText": "来月"
    }
  ]
}
```

Velvet validates, previews and receives user confirmation before commit.

## Capability: Natural-language Search

Suggested capability name:

`velvet.search.interpret.v1`

Purpose: interpret a user-entered natural-language query into safe Velvet search filters or references.

Example user query:

`去年誕生日に財布をあげた人`

AI Platform Core should return interpreted filter intent. Velvet performs canonical data retrieval locally/server-side against Velvet-owned records.

Do not send the entire customer dataset to AI Platform Core merely to answer search.

## Capability: Suggestion Ranking

Suggested capability name:

`velvet.suggestion.rank.v1`

This is optional. Prefer deterministic ranking first:

1. person-specific frequency/recency
2. user-level frequency/recency
3. app defaults

AI is only used if it materially reduces interaction and cannot be achieved cheaply/deterministically.

## AI usage and points

AI Platform Core remains canonical owner of AI usage accounting.

Velvet owns the commercial presentation of Velvet AI points and plan-specific price display, but must reconcile usage against AI Platform Core usage references.

Free users may purchase AI points at a higher unit price. Pro users may purchase at a lower unit price. Pro does not imply unlimited AI.

## Forbidden patterns

- automatic unsolicited daily coaching as default home content
- silently changing person/visit/gift/schedule canonical data from an uncertain model inference
- copying complete contact books to AI Platform Core
- sending payment/card details to AI Platform Core
- sending unrelated people when one person context is sufficient
- using AI Platform Core as Velvet's customer/person source of truth

## Observability

Cross-app calls should preserve platform observability conventions, including traceId/correlationId/requestId where defined by common contracts. Errors use the platform shared error/status conventions.
