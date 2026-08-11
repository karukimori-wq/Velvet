# Velvet Domain Model v0.1

## Purpose

Velvet owns a private, individual-use relationship and visit-memory domain for night-work professionals.

It is intentionally separate from the Growth Engine shared-platform `Customer` domain.

## Aggregate overview

### Person
Represents a private Velvet guest/person known to the user.

Core fields:
- `personId`
- `workspaceId`
- `ownerUserId`
- `displayName`
- `nickname`
- `birthday`
- `rank`
- contact refs/handles
- optional Pro image refs
- `createdAt`
- `updatedAt`

A Person may exist with only `displayName`.

### Visit
Represents a single visit occurrence.

Core fields:
- `visitId`
- `workspaceId`
- `ownerUserId`
- `startedAt`
- `endedAt`
- `durationMinutes` derived when both timestamps exist
- `visitContext`
- optional `salesAmount`
- optional `paymentMethod`
- optional receivable/売掛 note fields
- optional nomination/指名 fields
- `createdAt`
- `updatedAt`

`endedAt` may be null. Missing optional details must never invalidate a Visit.

### VisitParticipant
Links one Visit to one or more People.

Core fields:
- `visitParticipantId`
- `visitId`
- `personId`
- optional participant-specific role/context

Shared Visit data is stored once rather than copied to every Person.

### Knowledge
Represents structured remembered information about a Person.

Examples:
- occupation
- hobby
- favorite drink
- food preference
- smoking preference
- pet
- topic
- NG topic
- travel/business-trip fact
- other user-defined remembered information

Core fields:
- `knowledgeId`
- `personId`
- `category`
- `value`
- optional normalized value
- optional source Capture reference
- `effectiveAt`
- `createdAt`
- `updatedAt`

Knowledge must remain editable because human context changes over time.

### Relationship
Represents an explicitly confirmed relationship between two People.

Examples:
- friend
- coworker
- manager/subordinate
- family
- spouse/partner
- business partner/customer
- referral/introduction
- other

Core fields:
- `relationshipId`
- `fromPersonId`
- `toPersonId`
- `relationshipType`
- optional note
- `confirmedByUser`
- `createdAt`

Repeated co-visits alone do not create an asserted Relationship.

### Gift
Tracks gifts in both directions.

Core fields:
- `giftId`
- `personId`
- optional `visitId`
- `direction`: `received | given`
- `item`
- optional `occasion`
- optional `estimatedValue`
- optional Pro image refs
- `occurredAt`

### ScheduleEntry
Represents user- or Person-related work-relevant schedule information.

Examples:
- shift
- day off
- planned visit
- birthday
- accompaniment/同伴
- event
- trip
- known unavailable weekday/time
- self-investment appointment

Core fields:
- `scheduleEntryId`
- optional `personId`
- `entryType`
- `startsAt`
- optional `endsAt`
- optional recurrence/availability metadata
- optional note

### SelfInvestmentEntry
Represents lightweight self-investment tracking, not accounting.

Core fields:
- `selfInvestmentEntryId`
- `category`
- `amount`
- `occurredAt`
- optional note

### Capture
Universal raw input container.

Core fields:
- `captureId`
- optional `personId`
- optional `visitId`
- `inputType`: `stamp | suggestion | text | voice`
- raw text/transcript/value
- `status`: `raw | processing | confirmation_required | confirmed | failed`
- `createdAt`

Raw Capture must be retained when structuring fails so the user never has to re-enter the information.

### CaptureCandidate
Represents one proposed structured update produced from a user-triggered Capture action.

Examples:
- Knowledge candidate
- Gift candidate
- Schedule candidate
- Visit candidate
- Relationship candidate

No uncertain AI-derived candidate becomes canonical data until confirmed by the user.

### DictionaryEntry
Represents reusable learned suggestion values.

Core fields:
- `dictionaryEntryId`
- `category`
- `value`
- usage count
- last-used timestamp
- optional person-specific score/context

Suggestion ranking may combine person-specific history, user frequency/recency and application defaults.

## Cross-app reference rule

Velvet Person is not Growth Engine Customer.

An optional future field such as `growthCustomerRef` may map them only when an explicit contracted workflow and user intent exists.

Velvet Visit sales/payment notes remain personal history and are not Growth Engine canonical Payment/Sales state.
