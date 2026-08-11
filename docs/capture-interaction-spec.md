# Capture Interaction Specification v1.0

## Purpose
Capture is Velvet's universal low-friction input surface. It exists to remove the question: "Where should I enter this?"

## Entry model
Capture may open from:
- global navigation
- Person detail
- active Visit
- Schedule context

Context is attached automatically. The user should not re-select the current Person or Visit.

## Default layout
The surface should be thumb-friendly and compact:
1. recent/person-specific suggestion row
2. stamp grid or horizontally scrollable stamp row
3. single short text field
4. microphone action

Do not open the keyboard automatically when Capture opens.

## Stamp flow
Example:
- tap `Drink`
- show person-specific then user-level drink suggestions
- tap `響`
- persist the selected structured fact immediately if deterministic, with Undo

If the meaning is ambiguous, create a Capture candidate and require confirmation.

## Text flow
Example input:
`大阪出張、犬飼った、最近は響`

Flow:
1. save raw Capture
2. user taps `整理` or equivalent
3. AI returns candidate structures
4. show compact preview, e.g. 予定: 大阪出張 / ペット: 犬 / 好み: 響
5. user confirms all or edits/removes individual candidates
6. commit

Do not present database terminology to users.

## Voice flow
Voice is a shortcut for user-authored memory notes.

The microphone UI must clearly behave like push-to-record for the user's own note. It must not imply passive/ambient guest recording.

After transcription:
- show text
- allow quick correction
- use the same organization flow as typed Capture

## Suggestions
Suggestion ranking is dynamic but predictable:
- Person history first
- user history second
- defaults third

Suggestion labels may show recency or context subtly, but must not overwhelm the quick-action surface.

## User dictionary behavior
Confirmed custom values increment usage metadata.

Suggested fields:
- dictionaryEntryId
- ownerUserId
- category
- normalizedValue
- displayValue
- useCount
- lastUsedAt
- personUseCounts or derivable person-specific usage

The product may de-prioritize stale values automatically, but deletion from the dictionary should be user-controllable in Settings if needed.

## Confirmation philosophy
Confirmation exists to protect user intent, not create more work.

Rules:
- deterministic explicit stamp actions normally need no modal confirmation
- AI-inferred multi-field updates require a compact review
- one primary Confirm action
- no long forms
- Cancel retains raw Capture

## Keyboard target
At least 80% of recurring structured Capture actions should complete without keyboard entry after the user's dictionary has accumulated common values.

## Performance perception
Capture opening, stamp selection and local suggestion rendering should feel immediate. Network/AI processing must not block raw Capture persistence.

## Privacy
Do not automatically include contact information, payment information, raw long-term histories or unrelated Person details in AI calls. Context inclusion must be capability-scoped and minimized.
