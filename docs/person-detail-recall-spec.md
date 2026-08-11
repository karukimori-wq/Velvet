# Person Detail Recall Specification v1.0

## Purpose
Person Detail is a fast recall screen for the moment a guest arrives. It is not a profile completion form.

The user should be able to open a person and understand who they are within seconds.

## Core rule: populated-only display
The normal Person Detail view renders only fields that have an actual stored value.

- Never show empty labels.
- Never show placeholder rows for missing data.
- Never show `未入力` in the normal recall view.
- Never reserve vertical space for unused categories.
- Never show profile-completion percentages or prompts to fill missing fields.
- Missing fields are accessible only from Edit/More when the user intentionally wants to add them.
- A person with little data must produce a short screen.

## Priority order
The normal Person Detail view prioritizes:

1. Compact identity header
2. Personality / remembered context
3. Quick actions
4. Timeline

Do not split these across many tabs.

## Compact header
Show only when present:
- name
- optional Pro photo
- user-defined rank
- contact shortcuts
- next planned visit when useful

Do not display blank profile metadata.

## Personality
Personality is the primary recall area for `who is this person?`.

Show only populated values as compact chips or short grouped rows.

Potential content:
- personality / interaction style
- occupation / company
- hobbies / interests
- favorite drinks / food
- preferences
- NG topics / cautions
- marital status
- appearance: hairstyle, hair color, clothing/style, facial characteristics, glasses
- accessories/belongings: watch, watch brand/model, wallet brand, jewelry/accessories
- smoking preference
- relationship/referral labels
- other confirmed durable Knowledge

Personality should contain durable/current recall information. Event-specific facts belong primarily in Timeline.

If many values exist, show a compact high-value subset first with a user-triggered `もっと見る`. Do not make the arrival-time view excessively long.

## Quick actions
Keep thumb-reachable and compact:
- Start Visit
- Capture
- Gift
- Schedule
- Edit/More

Quick actions must not push Personality or Timeline far below the fold.

## Timeline
Timeline is the second primary surface.

Use one chronological stream containing concise entries such as:
- visits
- arrival/departure/duration
- seating reason
- sales/payment when recorded
- gifts received/given
- Capture-derived memories
- schedule events
- referrals/relationships
- notable changes to preferences/appearance/accessories when historically useful

Prefer concise timeline rows/cards: date/time + type/icon + short content.

Recent interactions must be easy to scan immediately.

## Arrival-time recall target
For a typical populated person, the first screenful should help answer:
- Who is this?
- What are they like?
- What do they like?
- What should I avoid?
- What happened recently?

The user must not need to scroll through empty fields or enter Edit mode to answer these questions.

## Design rule
When there is a conflict between showing more fields and making recall faster, choose faster recall.
