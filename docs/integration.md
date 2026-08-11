# Velvet Integration Boundaries v0.1

Provisional until Velvet is added to `professional-platform-contracts`.

## Existing constraint
Current platform contracts declare Growth Engine canonical owner of shared Customer management/profile, Reservation, Payment and Sales. Velvet requires a distinct individual personal-sales domain and must not silently create a second entity also called the shared platform `Customer`.

## Proposed Velvet-owned domain
- Guest/Person identity within Velvet
- Visit
- GuestKnowledge
- GuestRelationship
- Gift
- personal ScheduleEntry
- SelfInvestmentEntry
- input dictionary/suggestion state
- raw/structured Capture records

Canonical names must be approved in `professional-platform-contracts` before production cross-app integration.

## Growth Engine
Do not assume Velvet Guest equals Growth Engine Customer. Future mapping must be explicit, reference-based and opt-in (for example `growthCustomerRef`) with documented ownership/synchronization rules. Velvet must not overwrite Growth Engine canonical Customer, Payment or Sales state merely because similar information exists in a personal Visit record.

## AI Platform Core
AI Platform Core owns common AI runtime, capabilities and AI usage accounting. Velvet sends minimum context necessary for a user-triggered capability, preferring scoped references/structured input. Do not send unrelated contacts, payment data, full customer datasets or image libraries. Candidate capabilities include Capture structuring, natural-language retrieval and optional ranking assistance. AI usage/points accounting remains canonical in AI Platform Core.

## SNS Planner
Velvet may hand off user-selected posting intent/context. Do not automatically send private guest records, contacts, visit/gift histories or raw personal notes. SNS Planner owns PostDraft/post schedule internals.

## Platform Admin
May observe health/version/contract compliance/operational events, but does not own Velvet business data.

## Identity
Until contracts say otherwise, follow the platform MVP identity pattern where applicable: `workspaceId`, `userId`, `ownerUserId`. Do not require `professionalId` in MVP without a contract change.

## Required contract work
Before production cross-app integration, `professional-platform-contracts` must define Velvet responsibility, Velvet-owned terminology, Growth Engine Customer vs Velvet personal Guest/Person boundary, permitted reference mapping, API/event additions, and privacy/denylist rules for Velvet -> AI Platform Core and Velvet -> SNS Planner.
