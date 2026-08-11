# Velvet Coding Rules v0.1

## Product-first rule

When implementation convenience conflicts with Velvet's UX principles, preserve the user experience unless doing so would create a material safety, privacy, correctness, or reliability problem.

## Architecture

- Keep domain logic independent from UI components.
- Keep Velvet-owned domain entities separate from Growth Engine Customer/Payment/Sales entities.
- Cross-app references are IDs/references, not copied canonical business records.
- AI Platform Core owns AI runtime and usage accounting.
- Platform Admin receives operational telemetry only.
- SNS Planner receives only user-selected posting context needed for content creation.

## Naming

Use stable domain terms consistently:
- Person
- Visit
- VisitParticipant
- Knowledge
- Relationship
- Gift
- ScheduleEntry
- SelfInvestmentEntry
- Capture
- CaptureCandidate
- DictionaryEntry
- MediaAsset

Do not use `Customer` for Velvet's personal-sales Person entity.

## API response status

Top-level observability/business operation status must use:
- `success`
- `warning`
- `error`
- `skipped`

Domain-specific states belong in explicit fields such as `captureStatus`, `visitStatus`, or `importStatus`.

## Observability

Maintain where available:
- `traceId`
- `correlationId`
- `requestId`
- `sourceApp`
- `targetApp`
- `operation`
- `eventName`
- `status`
- `statusCode`
- `durationMs`
- `errorCode`
- `occurredAt`

Never include contact details, raw Capture text, personal notes, payment details, or images in observability payloads.

## Data rules

- All user-owned records must be scoped to authenticated owner/workspace context.
- Missing optional data is valid.
- Do not require artificial completeness before persisting a useful record.
- Prefer soft-delete where recovery is valuable.
- Free historical limits are query/entitlement rules, not destructive deletion.
- Server-side enforcement is required for plan restrictions such as image upload.

## Capture rules

- Preserve raw Capture before AI/rules processing.
- Processing failure must never discard the raw input.
- Inferred candidates remain in `CaptureCandidate` until accepted.
- Never silently mutate canonical records from uncertain AI output.
- A retry must reuse existing raw Capture rather than requiring re-entry.

## Suggestion rules

Rank suggestions using:
1. person-specific history
2. user-specific recency/frequency
3. application defaults

Suggestions may reorder UI choices but must not silently commit a value.

## UI rules

- Mobile-first.
- Common actions target <= 3 taps.
- Avoid explicit Save buttons for safe quick actions.
- Prefer Undo/edit over forcing confirmation for deterministic actions.
- Prefer chips/stamps/recent values before keyboard input.
- Avoid modal chains.
- Do not foreground unsolicited AI sales coaching.
- Do not add UI solely to expose an AI feature.

## API validation

Validate:
- authenticated ownership
- schema/type correctness
- plan entitlements
- references belong to same scope
- import schema version
- allowed enum values

Return machine-readable error codes.

## Cross-app privacy

Velvet -> AI Platform Core: send minimum necessary scoped context. Do not send unrelated contacts, full person database, full payment history, or image library.

Velvet -> SNS Planner: send only user-selected posting intent/context. Never auto-share private Person/Visit/Gift/Knowledge records.

Velvet -> Platform Admin: operational state only, not canonical personal-sales data.

## Testing priority

Prioritize tests for:
- ownership isolation
- Free/Pro entitlement enforcement
- Visit start/end and duration
- multi-person Visit shared fields
- Capture preservation and candidate confirmation
- suggestion ranking determinism
- historical access window
- JSON import validation/preview
- cross-app denylist/privacy rules

## Scope discipline

Do not add store management, POS, payroll, proactive sales scoring, health tracking, tax filing, or automatic cross-channel messaging to v1.0 without an explicit requirements change.
