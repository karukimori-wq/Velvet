# Velvet AI Capabilities v1.0

## Principle
Velvet is not AI-first. AI Platform Core is background infrastructure for user-triggered convenience. AI returns interpretations/candidates; Velvet remains responsible for authorized retrieval and confirmed professional memory.

## Capture organization
Current capability family structures user-authored Capture into candidate memory. Send only the minimum scoped context needed: authenticated workspace/user attribution, Growth Engine `customerId` reference when relevant, Capture reference/raw text required for the explicit action, and optional Visit reference.

Persist raw Capture before invoking AI. On unavailable/invalid AI response, preserve raw input and use deterministic local organization where possible. Uncertain AI-derived changes require confirmation before canonical Velvet memory is mutated.

## Search
Prefer deterministic local parsing/search when sufficient. Pro may use AI Platform Core for intent interpretation where it materially improves retrieval. Send the search phrase/minimum references, not the full customer database, timelines, gifts, images or unrelated private context.

## Suggestion ranking
Prefer deterministic ranking:
1. customer-specific frequency/recency
2. user-level frequency/recency
3. app defaults

AI ranking is optional and should exist only when it measurably reduces interaction.

## Usage
AI Platform Core is canonical for AI activity/usage. Velvet must not create an independent usage ledger.

Purchasable AI points do not yet have an approved shared purchase/wallet contract. Do not display/decrement a fabricated point balance or implement local point purchasing until that contract exists.

## Forbidden patterns
- unsolicited AI sales coaching as the default Home experience
- silent uncertain mutations
- copying the full customer dataset to AI Platform Core
- sending payment/card/sales data
- using AI Platform Core as Customer or Velvet-memory source of truth
- implementing AI as a reason to bypass Free/Pro history/feature gates

## Observability
Preserve trace/correlation/request identifiers where shared contracts define them. Operational telemetry must not contain raw Capture/private customer content.
