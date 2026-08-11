# Velvet UI Specification v1.0

## 1. UI objective
Velvet is mobile-first and optimized for speed, low cognitive load, and one-thumb operation. The interface must make common actions obvious without foregrounding AI or unsolicited coaching.

## 2. Global navigation
Bottom navigation:
- Home
- Search
- Capture
- People
- Schedule

Capture is visually emphasized as the central quick action. Settings is reached from the Home/profile menu rather than bottom navigation.

## 3. Home
Home is not an AI task dashboard. It prioritizes information the user explicitly expects to see.

Primary sections:
1. Today's planned visits
2. Quick search
3. Active visit, when present
4. Recently viewed people / recent activity shortcuts
5. Optional compact sales summary

Do not foreground "today you should contact..." or unsolicited action recommendations.

### Today's planned visits
Each card shows only:
- name
- planned time
- optional visit context
- one-tap open person
- one-tap start visit when appropriate

### Quick search
Search field is always easy to reach. It supports name/keyword entry and opens the full Search surface.

## 4. People list
Default list is compact and searchable.

Each row may show:
- Pro photo or initials placeholder
- display name
- user rank
- last visit
- next planned visit, if any

Primary actions:
- tap row -> Person Detail
- quick add person
- search/filter

A new person requires only a name. All other fields are optional.

## 5. Person Detail
Person Detail should avoid many tabs. Prefer one vertically scrollable surface.

Order:
1. header
2. compact key information
3. quick actions
4. timeline/history

### Header
- name
- optional photo
- rank
- contact shortcut(s)

### Quick actions
Thumb-reachable actions:
- Start Visit
- Capture
- Gift
- Schedule
- Edit/More

### Key information
Use compact chips/rows for known information such as birthday, occupation, favorite drink, hobbies, NG notes, common payment method, and relationship labels.

Do not show empty sections by default.

### Timeline
Single chronological timeline may include visits, gifts, Capture-derived knowledge changes, schedule events, referrals/relationships, and other relevant activity.

## 6. Active Visit
The active visit surface is designed for minimal interaction while working.

Header:
- participants
- arrival time
- live elapsed duration

Primary quick actions:
- Sales
- Payment
- Bottle/Order
- Gift
- Capture
- Add Participant

End Visit is always visible and one tap.

Ending a visit must not require sales/payment/memo completion.

## 7. Sales input
Prefer recent/common amount chips before keyboard.

Example:
- ¥10,000
- ¥30,000
- ¥50,000
- ¥100,000
- Other

Suggested values are learned from the user and context.

## 8. Payment input
One-tap chips:
- Cash
- Card
- QR
- Receivable / 売掛
- Other

The most likely option may be first, but never auto-committed without deterministic evidence.

## 9. Gift input
First choose direction:
- Received
- Given

Then show frequent/recent item chips. Optional fields such as value, occasion, memo, and Pro photo are secondary.

## 10. Capture
Capture opens with minimal chrome.

Primary input methods:
- stamps/quick chips
- learned suggestions
- text
- voice

The user should not choose a category first.

If user invokes organization/structuring, show a compact confirmation sheet:
- proposed item 1
- proposed item 2
- proposed item 3
- Confirm

Each proposed item can be edited or removed without entering a large form.

## 11. Search
Search contains:
- single primary search input
- recent searches
- learned/frequent quick chips
- results grouped by People / Visits / Gifts / Knowledge / Schedule when helpful

Natural-language retrieval is user-triggered. Do not show an AI chat interface unless it materially improves retrieval.

## 12. Schedule
Default to a simple list/calendar hybrid optimized for work-related events.

Show:
- own shifts/events
- planned visits
- birthdays
- user-recorded guest schedules / NG windows

Creating from Schedule is possible, but Capture should remain the fastest path for simple entries.

## 13. Empty states
Empty states must be actionable and short.

Examples:
- People: "名前だけで登録できます"
- Capture: "一言でも、音声でも"
- Search: "名前・趣味・前回の話などで検索"

Avoid long tutorials.

## 14. Forms
Full forms exist only as fallback/edit surfaces. They must not be the default path for frequent actions.

## 15. Visual behavior
- large tap targets
- strong hierarchy
- low-density screens during active work
- avoid modal stacks
- avoid mandatory multi-step wizards
- preserve input drafts when interrupted
- keyboard should not cover primary action controls
