# Velvet Visit Interaction Specification v1.0

## Purpose
Define the exact mobile interaction behavior for visit recording. This document overrides generic form conventions where they conflict with Velvet Product Principles.

## Entry points
A Visit can be started from:
- Person detail
- People search result quick action
- recent Person card quick action

Do not require navigation through a Visit list before starting.

## Start interaction
Primary button label: `来店`

On tap:
1. optimistic pressed state
2. request visit start
3. open Active Visit immediately on success
4. show compact non-blocking error on failure

Do not show confirmation for a normal visit start.

## Active Visit layout
Top:
- participant names
- arrived time
- elapsed duration

Middle:
- optional context chips when useful
- recent/selected visit facts

Bottom thumb zone:
- 売上
- 支払
- 注文
- Gift
- Capture
- 人追加

Persistent end action:
- `退店`

The end action must remain easy to reach but visually distinct from destructive delete actions.

## Quick sheets
Frequent actions open compact bottom sheets rather than full pages.

### Sales sheet
Show:
- recent Person amounts if any
- user recent amounts
- common amount chips
- `その他` for numeric input

Selecting a chip commits immediately and closes the sheet. Provide Undo/snackbar.

### Payment sheet
Show ranked methods. Selecting commits immediately and closes. If `売掛` is selected, optional details can be opened; do not force them.

### Order sheet
First show recent Person-specific values, then user-level values. Category can be inferred from the selected stamp/chip or explicitly changed if needed.

### Gift sheet
First choose direction only if not known from entry action. Then item suggestion. Optional fields are secondary.

## Add participant
Search Persons inline. Recently co-visited Persons may appear as convenience suggestions, but the UI must not label a relationship unless explicitly recorded.

## End interaction
Tap `退店` -> end immediately.

After completion, show compact summary:
- participants
- arrival/departure
- duration
- sales/payment only if entered

Primary actions after end:
- Capture
- Close/back

Do not force a post-visit checklist.

## Forgotten end
If an active visit exists later:
- display it clearly
- allow End now
- allow edit departure time manually
- allow leave as unknown only when resolving an already-incomplete imported/legacy record

Never fabricate a departure time.

## Offline behavior
If network is unavailable:
- allow user to capture a raw memo locally
- Visit start/end server-time semantics require synchronization handling before production implementation
- do not silently manufacture canonical server timestamps while offline

Offline Visit event strategy is deferred to a dedicated sync specification.

## Accessibility / ergonomics
- minimum comfortable tap targets
- no hover-only interaction
- do not rely solely on color to distinguish payment/status
- keyboard must not resize/zoom the interface unexpectedly on mobile
- frequent controls stay within thumb-accessible lower area where possible
