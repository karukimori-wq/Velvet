# Velvet API Specification v0.1

## Conventions
- Base path: `/api`
- JSON only
- All application responses use top-level `status`: `success | warning | error | skipped`
- Preserve `traceId`, `correlationId`, and `requestId` where applicable
- MVP identity scope: `workspaceId`, `userId`, `ownerUserId`
- `professionalId` is not required in MVP

## People
### POST /api/people
Create a Velvet-owned Person/Guest record.

Minimum input:
```json
{
  "workspaceId": "ws_x",
  "userId": "user_x",
  "name": "山田"
}
```

### GET /api/people
List/search people within the current user scope.

### GET /api/people/:personId
Fetch person summary, contact backup, accessible knowledge, relationships and timeline references.

### PATCH /api/people/:personId
Update explicit user-managed fields only. AI-derived changes are committed through confirmed Capture candidates, not silently through this endpoint.

## Visits
### POST /api/visits/start
Starts a visit and captures server time as `arrivedAt` unless an explicit allowed override is supplied.

```json
{
  "workspaceId": "ws_x",
  "userId": "user_x",
  "participantPersonIds": ["person_1"],
  "visitContext": "solo"
}
```

### POST /api/visits/:visitId/end
Sets `departedAt` and calculates duration. Departure may remain unknown if the user never ends the visit.

### PATCH /api/visits/:visitId
Optional details: participants, visitContext, salesAmount, paymentMethod, receivable metadata, nomination, bottle/drink/food notes, accompaniment, after-hours flags.

## Gifts
### POST /api/gifts
Creates a received/given gift record.

## Knowledge
### POST /api/knowledge
For explicit user-entered structured knowledge only.

### PATCH /api/knowledge/:knowledgeId
Edit or archive explicit knowledge.

## Relationships
### POST /api/relationships
Creates an explicit user-confirmed relationship between two people.

## Schedule
### POST /api/schedule-entries
Creates user or person-related schedule entry.

## Self-investment
### POST /api/self-investments
Creates lightweight self-investment record.

## Capture
### POST /api/captures
Persists raw capture first. Raw content must survive downstream AI failure.

Input supports `stamp`, `text`, `voice_text`, or a combination.

### POST /api/captures/:captureId/organize
User-triggered organization request. Calls AI Platform Core and returns candidate updates only.

### POST /api/captures/:captureId/confirm
Commits selected candidate updates after user confirmation.

## Search
### GET /api/search
Deterministic/basic search. No AI points required unless implementation explicitly delegates to AI.

### POST /api/search/natural
User-triggered natural-language retrieval. May consume AI points.

## Import/export
### POST /api/imports/validate
Validates JSON payload against current schema without writing.

### POST /api/imports/preview
Returns import diff/preview.

### POST /api/imports/commit
Writes confirmed valid import.

### GET /api/export
Exports the user's own Velvet data. Available to Free and Pro.

## Subscription and AI points
### GET /api/billing/plan
Returns current Velvet plan and feature access.

### GET /api/ai-points/balance
Returns point balance and pricing tier.

Velvet does not maintain an independent canonical AI usage ledger; detailed usage accounting belongs to AI Platform Core.

## Operational endpoints
### GET /health
### GET /version
### GET /contracts/status
Required for Platform Admin integration.

## Error shape
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "retryable": false
  },
  "traceId": "...",
  "correlationId": "...",
  "requestId": "..."
}
```
