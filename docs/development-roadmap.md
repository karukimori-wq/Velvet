# Velvet Development Roadmap v0.1

## Goal
Ship the smallest Velvet that proves the core promise: recording and retrieving relationship context is dramatically easier than notes/spreadsheets.

## Phase 0 — Foundation
- repository/app scaffold
- authentication and individual workspace model
- shared identity headers/trace conventions
- data persistence and migrations
- plan/entitlement model skeleton
- offline-capable raw memo/capture draft storage on mobile

## Phase 1 — People + Search
- create person with name only
- contact/SNS fields
- user-defined rank
- knowledge entries
- people search
- recent/frequent suggestions
- responsive mobile UI

Success condition: a new user can start with only today's people without completing a CRM form.

## Phase 2 — Visit
- visit start/end timestamps
- automatic duration
- multi-person visit
- optional sales amount
- payment method
- visit context
- receivable metadata
- quick actions

Success condition: visit start <=2 taps and visit end 1 tap from active-visit context.

## Phase 3 — Capture + Dictionary
- stamps
- user dictionary
- person-specific suggestion ranking
- short text
- voice input/transcript input
- raw Capture preservation
- compact confirmation model

Success condition: common post-visit notes can normally be captured in <=30 seconds.

## Phase 4 — AI Platform Core
- `velvet.capture.structure.v1`
- AI usage/point reconciliation
- natural-language query interpretation
- failure/retry behavior preserving raw input

AI remains user-triggered and visually understated.

## Phase 5 — Gifts + Relationships + Schedule
- received/given gifts
- relationship edges
- co-visit context
- personal and person-related schedule
- known NG weekdays/time windows
- Capture-to-schedule candidate flow

## Phase 6 — Import/Export
- JSON schema validation
- preview
- error reporting
- import job idempotency
- copyable external-AI transformation instructions
- user data export

## Phase 7 — Plans
### Free
- unlimited People
- rolling 1-year historical access
- no image storage
- AI points purchasable at higher unit price

### Pro
- JPY 10,000/month target
- full historical access
- image support
- lower AI point unit price
- eligible advanced integrations/features

## Phase 8 — Images / Pro storage
- profile image
- business card
- gift/bottle/other supported images
- compression/size limits
- storage quota/abuse protections

Do not promise literal unlimited image storage.

## Phase 9 — SNS Planner / Platform Admin integration
- explicit user-triggered SNS handoff
- health/version/contracts/status surfaces
- Platform Admin observability

## Non-goals before product validation
Do not prioritize store dashboards, POS, payroll, proactive AI coaching, gamification, tax filing, automatic LINE synchronization, cross-channel automation, health tracking or complex analytics.

## Product review gate
Before each new major feature, answer:

1. Does it reduce recurring user effort?
2. Does it fit People / Visit / Capture / Search / Schedule rather than adding another top-level surface?
3. Can it be completed without adding mandatory fields?
4. Can likely choices be suggested instead of typed?
5. Does AI remain user-triggered where inference is uncertain?

If the feature fails these tests, defer it.
