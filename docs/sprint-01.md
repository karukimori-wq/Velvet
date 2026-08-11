# Velvet Sprint 01 — Foundation + People/Search

## Goal

Deliver the first usable Velvet slice without AI dependency: authenticate an individual user, create and browse People, search quickly, and establish the mobile-first shell that future Visit/Capture flows build on.

## Scope

### 1. App shell
- responsive mobile-first layout
- bottom navigation shell for Home, Search, Capture placeholder, People, Settings
- dark-mode-ready visual system following `design-system.md`
- thumb-reachable primary actions

### 2. Authentication and owner scope
- authenticated owner/workspace context
- enforce `workspaceId`, `userId`, `ownerUserId`
- no mandatory `professionalId`
- every People query/write scoped server-side

### 3. Person CRUD
Implement:
- create Person with display name only
- list People
- Person detail
- edit optional fields
- soft delete/archive where selected by implementation

Initial optional fields:
- nickname
- birthday / age range
- phone
- email
- LINE
- Instagram
- X
- TikTok
- occupation
- company
- area
- rank

Do not implement images in Sprint 01.

### 4. Basic Knowledge
Support manual lightweight Knowledge entries from Person detail.

Initial categories:
- hobby
- favoriteDrink
- food
- work
- travel
- pet
- preference
- ngTopic
- other

No AI organization yet.

### 5. Basic Search
Search must support:
- display name/nickname
- contact text
- occupation/company
- Knowledge values

Target common result retrieval <= 5 seconds under MVP dataset sizes.

Search UI should be simple and immediately usable from Home/Search surfaces. Do not build an advanced filter builder.

### 6. Dictionary foundation
When a user manually adds reusable values such as occupation, hobby, drink or Knowledge value, update/reuse `DictionaryEntry` where appropriate.

Sprint 01 only needs deterministic recency/frequency support. No AI ranking.

### 7. Plan foundation
Create server-side entitlement abstraction for:
- `free`
- `pro`

Sprint 01 requirements:
- People unlimited on both plans
- image entitlement flag exists but upload is not implemented yet
- historical access helper exists for later Visit/Memory features

### 8. Operational endpoints
Implement or reserve standard surfaces:
- `/health`
- `/version`
- `/contracts/status`

Responses should follow common status vocabulary: `success`, `warning`, `error`, `skipped`.

Maintain trace/correlation/request IDs where applicable.

## UX acceptance criteria

- A new Person can be created with only one required value: name.
- The user can reach Person creation from the main mobile UI without navigating through a settings/admin surface.
- No unnecessary Save button chain.
- Search is always easy to reach.
- No unsolicited AI recommendation card appears on Home.
- No AI branding is required for this sprint.
- No user is forced to complete optional Person fields.

## Security/privacy acceptance criteria

- User A cannot read/write User B's People or Knowledge through API manipulation.
- Contact values never appear in observability logs/events.
- Velvet Person is not written into Growth Engine Customer automatically.
- Platform Admin receives no Person master payload.

## Tests

Minimum automated tests:
- Person create with name only
- optional fields accepted as null
- owner/workspace isolation
- Person search by name
- search by Knowledge value
- DictionaryEntry reuse/update
- Free/Pro People unlimited behavior
- `/health`, `/version`, `/contracts/status` response shape

## Explicitly not in Sprint 01

- Visit
- arrival/departure timer
- gifts
- multi-person visits
- voice Capture
- AI Platform Core calls
- natural-language AI search
- image upload
- SNS Planner integration
- AI points purchase
- proactive coaching

## Definition of Done

Sprint 01 is complete when a user can sign in on a smartphone, create People with minimal input, attach simple Knowledge, find them quickly, and all data is owner-isolated with the common observability/contract surfaces in place.
