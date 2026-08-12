# Velvet Integration Boundaries v1.1

Velvet is a Professional App connected to Growth Engine.

## Canonical ownership

Growth Engine owns:
- Customer
- Reservation / Visit Schedule
- Payment
- Sales
- paymentStatus
- salesAmount
- customer-level revenue
- repeat / referral / business analysis state

Velvet owns:
- Velvet Customer Memory / Professional Profile keyed by `customerId`
- Professional Visit record
- service/seat context
- conversation memo
- preference memo
- caution memo
- last interaction summary
- next topic / next action memo
- professional timeline
- Recall UI

Velvet must not create or edit a competing Customer master.

## Growth Engine -> Velvet

Allowed reference/context fields:
- `workspaceId`
- `userId`
- `customerId`
- `reservationId` OR `visitScheduleId`
- `intent`

Do not send unless a separately approved contract explicitly requires it:
- `paymentStatus`
- `salesAmount`
- Payment records
- Stripe secrets or Stripe payment details

Customer display fields such as name/contact are fetched from Growth Engine for display. Velvet may retain a non-canonical `displayNameSnapshot` only when needed for resilient UI; it must never be edited or presented as the Customer source of truth.

## Velvet -> Growth Engine

Return references only as needed:
- `visitId`
- `noteId`
- `lastVisitAt`
- `nextActionRef`
- `summaryRef`

Do not return private memo bodies by default. Do not return `paymentStatus`, `salesAmount` or Stripe information.

## AI Platform Core

AI Platform Core owns AI execution and AI usage. Velvet may send only the minimum user-triggered memo/search content needed for a capability. Customer/Payment/Sales canonical data is not copied into AI Platform Core.

## SNS Planner / MessageDraft

`MessageDraft` is a formal contract owned by SNS Planner.

Approved operations used by the platform:
- `MessageDraft.Generate`
- `MessageDraft.Rewrite`
- `MessageDraft.Metadata`

MVP HTTP mapping for generation:
- `POST /api/message-drafts`

Velvet exposes an explicit user-triggered handoff from the customer detail UI. Velvet does not own or persist MessageDraft canonical state.

Velvet sends only the approved minimum request fields:
- `workspaceId`
- `userId`
- `sourceApp: velvet`
- `targetStudio: velvet`
- `channel`
- `purpose`
- `audienceSegment`
- `tone`
- `cta`
- `inputRef`

For a customer-specific request, `inputRef` is reference-only, e.g. `velvet:customer:<customerId>`.

Velvet must not send through MessageDraft:
- Customer master records
- contact-list dumps
- payment state
- `salesAmount`
- Stripe data
- full professional notes
- full conversation timeline bodies
- API keys / access tokens / secret prompts

Expected response fields:
- top-level `status` in `success | warning | error | skipped`
- `messageDraftId`
- `messageDraftStatus`
- `channel`
- `purpose`
- `eventName: sns.message_draft.created.v1`
- `traceId`
- `correlationId`
- `requestId`

Velvet may display returned draft text if the SNS Planner transport includes it, but does not make that text canonical. SNS Planner owns MessageDraft state and publishes `sns.message_draft.created.v1` / `sns.message_draft.updated.v1`.

Runtime configuration:
- `SNS_PLANNER_BASE_URL`
- status surface: `GET /api/message-drafts/status`

## Platform Admin

Platform Admin may observe health/version/contracts/operational status only. It must not receive private memo bodies, Customer contact data, Sales/Payment data or professional timeline content.

## Identity

Use:
- `workspaceId` for business scope
- `userId` for acting user
- `customerId` as the Growth Engine Customer reference

Do not require `professionalId` for MVP.
