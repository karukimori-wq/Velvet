# Velvet Event Specification v0.1

## Naming
Use lowercase dot-delimited versioned names.

## Domain events
- `velvet.person.created.v1`
- `velvet.person.updated.v1`
- `velvet.visit.started.v1`
- `velvet.visit.ended.v1`
- `velvet.visit.updated.v1`
- `velvet.gift.recorded.v1`
- `velvet.relationship.recorded.v1`
- `velvet.schedule.recorded.v1`
- `velvet.self_investment.recorded.v1`
- `velvet.capture.created.v1`
- `velvet.capture.organized.v1`
- `velvet.capture.confirmed.v1`
- `velvet.import.completed.v1`
- `velvet.export.completed.v1`

## AI-related events
AI Platform Core owns AI activity/usage events. Velvet may emit only app-level workflow events such as Capture organized/confirmed, while AI Platform Core emits its own canonical AI activity event.

## Envelope
```json
{
  "eventName": "velvet.visit.started.v1",
  "status": "success",
  "sourceApp": "velvet",
  "workspaceId": "ws_x",
  "userId": "user_x",
  "traceId": "trace_x",
  "correlationId": "corr_x",
  "requestId": "req_x",
  "occurredAt": "2026-08-11T22:00:00+09:00",
  "data": {
    "visitId": "visit_x"
  }
}
```

## Privacy
Events should contain references and operational metadata, not full contact records, raw notes, payment card data, full images, or large Capture payloads.
