# Velvet -> AI Platform Core connection

## Transport

Velvet uses the existing AI Platform Core HTTP server. Do not create Velvet-specific transport endpoints inside AI Platform Core.

- AI execution: `POST /v1/gateway/run`
- AI usage: `GET /v1/analytics/usage`

AI Platform Core automatically creates/completes Activity records and records Usage when the Gateway succeeds.

## Client Manifest

The deployed AI Platform Core runtime must register a Client Manifest whose id matches `AI_PLATFORM_CORE_CLIENT_ID` in Velvet.

Recommended MVP id:

`velvet`

Required capabilities/permissions:

- `velvet.capture.structure`
- `velvet.search.parse_intent`

The Client Manifest controls provider/model/budget. Provider secrets remain only in AI Platform Core.

## Shared operation mapping

| Shared contract operation | AI Platform Core capability | Transport |
| --- | --- | --- |
| `VelvetCapture.Structure` | `velvet.capture.structure` | `POST /v1/gateway/run` |
| `VelvetSearch.ParseIntent` | `velvet.search.parse_intent` | `POST /v1/gateway/run` |
| `Usage.List` | analytics usage query | `GET /v1/analytics/usage` |

## Identity and attribution

Velvet sends:

- `auth.clientId`: configured AI Platform Core Client Manifest id
- `activity.client`: same client id
- `activity.userId`: authenticated Velvet owner/user id
- `activity.ownerUserId`: authenticated Velvet owner id
- `activity.workspaceId`: only when a real workspace reference exists
- `activity.workflow`: `velvet`

Do not invent a workspace id only to satisfy analytics.

## Privacy

Capture structuring may send only the user-triggered raw Capture text needed for that invocation.

Search intent parsing sends only the user's search phrase. It does not send the People database, contact details, timelines, gifts, payment history, relationship graph, or images.

Velvet performs the resulting search locally against owner-scoped Velvet data.

## Failure behavior

If AI Platform Core is not configured, unavailable, unauthorized, or returns an invalid result:

- Preserve the original Capture.
- Fall back to deterministic local Capture organization/search parsing.
- Return a warning internally rather than blocking the user's workflow.
- Do not fabricate an AI Activity id or usage record.

## Usage vs points

AI Platform Core is the source of truth for AI usage (count, tokens, cost). The current `/v1/analytics/usage` contract is not a point-wallet contract.

Velvet's future purchasable points require a separate billing/entitlement contract. Until that exists, do not display or decrement a fabricated point balance.
