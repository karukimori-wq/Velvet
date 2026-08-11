# Velvet Database Schema v0.1

This schema is implementation-oriented and follows the current domain model. Exact SQL/ORM syntax may vary by stack, but ownership and relationships should remain stable.

## Scope and tenancy

All records are scoped to the authenticated owner/workspace context.

Common fields where applicable:
- `id`
- `workspaceId`
- `ownerUserId`
- `createdAt`
- `updatedAt`
- `deletedAt` nullable for soft delete where useful

MVP must not require `professionalId`.

## Person

Represents a Velvet-owned personal sales contact. This is not the shared Growth Engine Customer entity.

Fields:
- `personId`
- `workspaceId`
- `ownerUserId`
- `displayName`
- `nickname` nullable
- `birthday` nullable
- `ageRange` nullable
- `phone` nullable
- `email` nullable
- `lineHandle` nullable
- `instagramHandle` nullable
- `xHandle` nullable
- `tiktokHandle` nullable
- `otherContactsJson` nullable
- `occupation` nullable
- `company` nullable
- `area` nullable
- `rank` nullable, user-defined
- `primaryImageRef` nullable, Pro only
- `growthCustomerRef` nullable, future explicit opt-in mapping only
- timestamps

Indexes:
- `(workspaceId, ownerUserId, displayName)`
- `(workspaceId, ownerUserId, updatedAt)`

## Visit

Fields:
- `visitId`
- `workspaceId`
- `ownerUserId`
- `visitDate`
- `arrivalAt` nullable
- `departureAt` nullable
- `durationMinutes` nullable, derived
- `visitContext` nullable
- `salesAmount` nullable
- `paymentMethod` nullable
- `receivableAmount` nullable
- `receivableStatus` nullable
- `nominationType` nullable
- `accompanimentFlag` nullable
- `afterHoursFlag` nullable
- `orderSummaryJson` nullable
- `noteSummary` nullable
- timestamps

Indexes:
- `(workspaceId, ownerUserId, visitDate desc)`
- `(workspaceId, ownerUserId, arrivalAt desc)`

## VisitParticipant

Fields:
- `visitParticipantId`
- `visitId`
- `personId`
- `role` nullable
- `personSpecificSalesAmount` nullable
- timestamps

Unique:
- `(visitId, personId)`

## Knowledge

Small searchable facts about a person.

Fields:
- `knowledgeId`
- `workspaceId`
- `ownerUserId`
- `personId`
- `category`
- `value`
- `normalizedValue` nullable
- `sourceType` (`manual`, `capture`, `import`, `system`)
- `sourceRef` nullable
- `confidence` nullable; advisory only
- `occurredAt` nullable
- timestamps

Examples categories: hobby, favoriteDrink, food, smoking, work, travel, pet, preference, ngTopic, other.

Indexes:
- `(workspaceId, ownerUserId, personId, category)`
- search index on `value`/`normalizedValue` as supported by selected database.

## Relationship

Fields:
- `relationshipId`
- `workspaceId`
- `ownerUserId`
- `fromPersonId`
- `toPersonId`
- `relationshipType`
- `note` nullable
- `confirmedByUser` boolean default true
- timestamps

Examples: friend, coworker, boss, subordinate, family, partner, referral, client, other.

Do not auto-create semantic relationships solely from co-visit data.

## Gift

Fields:
- `giftId`
- `workspaceId`
- `ownerUserId`
- `personId`
- `direction` (`received`, `given`)
- `item`
- `occasion` nullable
- `estimatedValue` nullable
- `giftDate`
- `memo` nullable
- `imageRef` nullable, Pro only
- timestamps

## ScheduleEntry

Fields:
- `scheduleEntryId`
- `workspaceId`
- `ownerUserId`
- `personId` nullable
- `entryType`
- `title`
- `startAt` nullable
- `endAt` nullable
- `allDay` boolean default false
- `recurrenceJson` nullable
- `memo` nullable
- timestamps

Examples entryType: shift, dayOff, plannedVisit, birthday, trip, unavailableWindow, appointment, accompaniment, event, selfInvestment.

## SelfInvestmentEntry

Fields:
- `selfInvestmentEntryId`
- `workspaceId`
- `ownerUserId`
- `entryDate`
- `category`
- `amount`
- `memo` nullable
- timestamps

## Capture

Raw user-triggered input that must never be lost even if organization fails.

Fields:
- `captureId`
- `workspaceId`
- `ownerUserId`
- `personId` nullable
- `visitId` nullable
- `inputType` (`stamp`, `suggestion`, `text`, `voice`)
- `rawText` nullable
- `rawPayloadJson` nullable
- `status` (`raw`, `processing`, `candidate_ready`, `confirmed`, `failed`)
- `aiActivityRef` nullable
- timestamps

## CaptureCandidate

AI- or rules-derived candidate updates awaiting user confirmation.

Fields:
- `captureCandidateId`
- `captureId`
- `candidateType`
- `targetPersonId` nullable
- `candidatePayloadJson`
- `confidence` nullable
- `status` (`pending`, `accepted`, `rejected`, `edited`)
- timestamps

No inferred candidate may mutate canonical domain records before acceptance.

## DictionaryEntry

User-level reusable suggestions.

Fields:
- `dictionaryEntryId`
- `workspaceId`
- `ownerUserId`
- `dictionaryType`
- `value`
- `normalizedValue` nullable
- `usageCount` default 0
- `lastUsedAt` nullable
- timestamps

Unique where practical:
- `(workspaceId, ownerUserId, dictionaryType, normalizedValue)`

## MediaAsset

Pro-only image metadata.

Fields:
- `mediaAssetId`
- `workspaceId`
- `ownerUserId`
- `personId` nullable
- `giftId` nullable
- `assetType`
- `storageRef`
- `mimeType`
- `byteSize`
- `width` nullable
- `height` nullable
- timestamps

Free users must be blocked server-side from creating MediaAsset records.

## SubscriptionSnapshot

Velvet-local entitlement snapshot only. Billing provider state remains canonical in the billing system selected for Velvet.

Fields:
- `workspaceId`
- `ownerUserId`
- `plan` (`free`, `pro`)
- `historyAccessDays` nullable; Free target 365, Pro null/unlimited
- `imagesEnabled`
- `advancedSearchEnabled`
- `snsPlannerIntegrationEnabled`
- `updatedAt`

## AI Point Display Cache

AI Platform Core is canonical for AI usage/points accounting. Velvet may cache the current display balance/status.

Fields:
- `workspaceId`
- `ownerUserId`
- `balanceSnapshot`
- `pricingTierSnapshot`
- `sourceUpdatedAt`
- `cachedAt`

This is not an independent usage ledger.

## Retention rule

Free plan historical access is a visibility/entitlement rule, not a destructive deletion rule. Queries should enforce the accessible window while retained records remain stored according to the production retention policy.

## Privacy

Contact data, raw Capture text and personal relationship notes are sensitive application data. They must not be placed in observability events, analytics payloads, URLs, or cross-app messages except where explicitly required and contractually allowed.
