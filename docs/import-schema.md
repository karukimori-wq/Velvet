# Velvet JSON Import Schema v0.1

## Purpose

Allow users to migrate existing Excel/CSV/notes data into Velvet without requiring Velvet to directly ingest the source into an AI system.

The user may copy the published transformation prompt and schema, use an external AI tool to create compatible JSON, then upload/paste JSON into Velvet for validation and preview.

## Top-level envelope

```json
{
  "schemaVersion": "velvet-import-0.1",
  "people": [],
  "visits": [],
  "relationships": [],
  "gifts": [],
  "scheduleEntries": [],
  "selfInvestments": []
}
```

## Person

```json
{
  "externalRef": "optional-source-id",
  "name": "山田 太郎",
  "nickname": "山田さん",
  "birthday": "1985-05-12",
  "contacts": {
    "phone": null,
    "email": null,
    "line": null,
    "instagram": null,
    "x": null,
    "tiktok": null,
    "other": []
  },
  "occupation": null,
  "company": null,
  "area": null,
  "rank": null,
  "knowledge": [
    {
      "category": "hobby",
      "value": "ゴルフ"
    }
  ]
}
```

Only `name` is required for a person.

## Visit

```json
{
  "externalRef": "visit-001",
  "participantExternalRefs": ["person-001"],
  "visitedAt": "2026-08-10",
  "arrivalTime": "21:10",
  "departureTime": "23:40",
  "context": "business",
  "salesAmount": 120000,
  "paymentMethod": "card",
  "receivableAmount": 0,
  "notes": []
}
```

Unknown fields may be omitted or null. Arrival/departure may be absent.

## Relationship

```json
{
  "fromExternalRef": "person-001",
  "toExternalRef": "person-002",
  "type": "coworker",
  "memo": null
}
```

## Gift

```json
{
  "personExternalRef": "person-001",
  "direction": "received",
  "item": "財布",
  "date": "2026-07-01",
  "occasion": "birthday",
  "estimatedValue": null,
  "memo": null
}
```

`direction` is `received` or `given`.

## ScheduleEntry

```json
{
  "personExternalRef": "person-001",
  "subject": "大阪出張",
  "startAt": "2026-09-03T09:00:00+09:00",
  "endAt": null,
  "type": "guest_event",
  "memo": null
}
```

## SelfInvestmentEntry

```json
{
  "date": "2026-08-10",
  "category": "beauty",
  "amount": 12000,
  "memo": "ネイル"
}
```

## Validation rules

- reject unsupported `schemaVersion`
- preview before commit
- reject duplicate `externalRef` inside one import file
- unresolved relationship/visit person references are reported, not silently discarded
- unknown optional properties may be ignored with warnings
- invalid dates/amounts show per-record errors
- import is idempotent when the same externalRef is re-imported under the same import job strategy

## Privacy rule

Velvet does not automatically send uploaded source Excel/CSV files to AI Platform Core. Transformation with an external AI is initiated by the user outside Velvet using the published prompt/instructions.
