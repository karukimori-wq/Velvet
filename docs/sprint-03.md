# Sprint 03 — Capture, Stamps, Voice, Dictionary

## Goal
Implement Velvet's core low-friction memory capture experience without turning the product into an AI-first UI.

## Scope

### Capture entry points
- global Capture action available from primary navigation
- person-context Capture from a Person detail screen
- active-Visit Capture from the Visit screen
- optional Schedule-context Capture where relevant

### Input modes
- stamps / quick actions
- learned suggestions
- short text
- voice input converted to text before structuring

All modes feed the same Capture model.

### Capture persistence
Create a raw Capture record immediately before any AI organization attempt.

Required fields:
- captureId
- workspaceId
- ownerUserId
- userId
- sourceContext: global | person | visit | schedule
- personId? / visitId? / scheduleEntryId?
- rawText or normalized stamp payload
- inputMode: stamp | suggestion | text | voice
- createdAt
- organizationStatus: pending | organized | failed | skipped

Raw Capture must never be destroyed merely because parsing or AI organization fails.

### Stamps
Initial stamp categories should include a compact, editable default set such as:
- drink / bottle
- gift
- work
- hobby
- food
- travel / schedule
- pet
- relationship/context
- payment
- visit context
- memo / other

Exact labels/icons are presentation concerns and may vary by night-work genre, but the underlying category identifiers should remain stable.

### Learned suggestions
After confirmed use, values become reusable candidates.

Ranking order:
1. person-specific recent/frequent values
2. current user's recent/frequent values
3. app defaults

Do not silently auto-select a suggestion.

### Voice
Voice capture is not ambient recording and must not record guest conversations.

It is for the user to speak a short memory note after or during their own workflow.

Flow:
1. user taps microphone
2. user speaks
3. speech is converted to text
4. transcript is shown/editable
5. user chooses organize/confirm flow

If transcription fails, preserve any locally available recording/transcript state only according to the final privacy/storage implementation. Do not create a hidden long-term audio archive by default.

### AI organization
AI is user-triggered.

Input should be minimum necessary context, preferably:
- captureId
- personId reference if applicable
- current structured categories allowed for this action
- raw capture text
- optional limited recent relevant context only when needed

Do not send full contact profiles, full visit histories, payment details, images, or unrelated notes.

Output is a list of `CaptureCandidate` objects, not canonical writes.

Candidate types may include:
- knowledge
- gift
- schedule
- visit attribute
- relationship
- dictionary suggestion

### Confirmation
Show a compact review surface:
- proposed additions/changes
- one primary Confirm action
- per-item edit/remove
- Cancel leaves raw Capture intact

Confirmed candidates are committed atomically where possible.

### Failure behavior
If AI or transcription fails:
- raw Capture remains saved
- user sees a lightweight retry option
- user is not asked to re-enter original content
- no phantom structured records are created

## Non-goals
- proactive AI coaching
- autonomous relationship inference
- ambient recording
- automatic contact-message ingestion
- full semantic search over all private data
- image analysis

## Acceptance criteria
- text Capture can be saved in <= 2 actions after entering text
- common stamp Capture can be completed in <= 3 taps
- raw Capture survives organization failure
- learned suggestions appear after confirmed use
- person-specific suggestions outrank user-global suggestions
- voice path never implies recording guest conversations
- AI results require confirmation before canonical domain updates
- AI failure does not block normal Velvet usage
