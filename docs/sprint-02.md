# Velvet Sprint 02 — Visit Core v1.0

## Goal
Implement Velvet's core visit experience with the fewest possible taps.

This sprint intentionally prioritizes deterministic convenience over AI. The product should already feel useful without AI assistance.

## Scope

### 1. Start Visit
From a Person detail surface:
- primary action: `来店`
- starting a visit creates `Visit.status = active`
- `arrivedAt` uses the current server timestamp
- no form is shown before creation
- return the new `visitId`

Target: <=2 taps from Person context.

### 2. Active Visit Surface
Show:
- participant names
- arrival time
- live elapsed duration calculated client-side from `arrivedAt`
- quick actions: Sales, Payment, Bottle/Order, Gift, Capture, Add Person
- one-tap `退店` action

Do not require any optional field before ending a visit.

### 3. End Visit
- one tap from active visit
- set `departedAt` to current server timestamp
- calculate canonical duration from `arrivedAt` and `departedAt`
- status becomes `completed`
- missing optional visit details remain valid

### 4. Multi-person Visit
- add one or more existing Persons to an active visit
- create one Visit with multiple VisitParticipants
- shared data is entered once
- removing a participant must not delete the Person
- repeated co-visits may be stored as factual history only; do not infer friendship/company/family automatically

### 5. Visit Context
Optional one-tap values:
- solo
- friends
- business
- entertainment
- accompaniment
- group
- other

Frequently/recently used values should be ranked first when dictionary support is available.

### 6. Sales Amount
Optional.

UX:
- show learned/recent amount chips first
- allow common amount chips
- custom numeric entry only when needed
- no mandatory Save button for a single update

Store amount with currency JPY in MVP unless contract changes later.

### 7. Payment Method
Optional one-tap values:
- cash
- card
- qr
- receivable
- other

Rank Person-specific history first, then user-level frequency/recency, then defaults.

Never auto-commit a predicted payment method.

### 8. Receivable / 売掛
If payment method is receivable, allow optional:
- receivable amount
- due date
- note
- local status metadata

Important: this is a Velvet personal visit record, not a canonical Growth Engine Payment record.

### 9. Orders / Bottle / Drink
Optional quick entries for:
- bottle
- champagne
- drink
- food
- other

Use DictionaryEntry suggestions. New values may be entered and become future suggestions.

### 10. Gift shortcut
From active Visit, opening Gift preselects the current Visit and participant when unambiguous.

Track:
- direction: received / given
- item
- optional value
- optional occasion

### 11. Capture shortcut
Capture launched from an active Visit automatically carries `visitId` and selected `personId` when known.

Sprint 02 stores raw Capture safely even if AI structuring is not implemented yet.

## API acceptance
Expected minimum endpoints:
- POST `/api/visits/start`
- GET `/api/visits/:visitId`
- PATCH `/api/visits/:visitId`
- POST `/api/visits/:visitId/end`
- POST `/api/visits/:visitId/participants`
- DELETE `/api/visits/:visitId/participants/:personId`
- POST `/api/visits/:visitId/orders`

All API responses use top-level observability `status: success | warning | error | skipped`.

## Events
Emit reference-only events:
- `velvet.visit.started.v1`
- `velvet.visit.updated.v1`
- `velvet.visit.completed.v1`
- `velvet.visit.participant_added.v1`

Do not emit names, contact information, payment details, sales amounts, notes, or Capture text in shared operational events.

## UX acceptance criteria
- Visit starts without a pre-form.
- Visit can end with one tap.
- User can complete a visit with only Person + start + end.
- Optional data never blocks completion.
- Multi-person shared data is not duplicated manually.
- Current elapsed time is visible during active Visit.
- Person-specific payment suggestion can be selected in one tap.
- Common visit interactions are reachable with one thumb on smartphone.

## Out of scope
- proactive AI coaching
- AI prediction of next customer action
- store POS integration
- canonical payment settlement
- staff sharing
- payroll
- automatic relationship inference
