# Velvet UI Specification v1.1

See `docs/current-product-contract.md` for the current product boundary.

## Objective
Velvet is mobile-first, one-thumb friendly, calm, and fast. The user-facing verbs are **覚える / 思い出す / 次につなぐ**. AI stays backstage.

## Navigation
Daily bottom navigation contains four primary destinations: **ホーム / お客様 / 覚える / 予定**. `覚える` is visually emphasized. Search is a first-class screen reached from the drawer and customer/search entry points. The drawer also exposes Plan and Settings.

## Home
Home shows expected operational context rather than unsolicited coaching:
- compact daily metrics
- due follow-ups when Pro
- `そろそろ` when Pro and enabled
- today's planned visits/events
- quick links to recall a customer or capture a memory

No sales/revenue summary belongs in Velvet Free/Pro; Growth Engine owns that truth.

## Customer list
- searchable by name/known memory
- compact row with initials/name/latest contact and useful next-action context
- per-customer `＋ 覚える` shortcut
- sorting: name, recent visit, visit count; Pro adds `そろそろ`, due follow-up, open follow-up
- no visible pinning workflow

A new customer starts with the minimum necessary identity and immediately continues into memory capture. Velvet references Growth Engine customer identity rather than becoming a competing Customer master.

## Customer detail
Use one vertical recall surface, not many tabs:
1. identity
2. four quick actions: 覚える / 思い出す / 次につなぐ / 予定
3. active visit/start visit
4. save confirmation when returning from Capture
5. recall summary (`そろそろ` and urgent follow-ups when entitled)
6. known customer memory only; hide unknown fields
7. Pro next actions
8. Pro images
9. history: Free event-by-event inside 3 months, Pro integrated full timeline

Never show canonical sales/payment state in this surface.

## Capture
Global Capture first asks who the memory belongs to. Customer-context Capture keeps the customer automatically.

Primary inputs:
- stamps/quick choices
- short text
- Pro voice input

Do not auto-open the keyboard. Preserve raw input before organization. Organization/review lets the user deselect incorrect candidates, confirm once, continue capturing, or return to edit. After save, return to the customer and show what was added.

## Search
Free uses basic keyword search. Pro may search retained conversations/gifts/full memory and use natural-language-like deterministic parsing. AI chat is not the search UI.

## Schedule
Show Velvet display events and Growth Engine schedule references where contractually available. A customer-linked schedule item links back to Customer Detail. Capture remains the fastest path for conversational schedule candidates.

## Follow-up
Pro can create next actions with an optional due date. Home/customer surfaces display due state. `そろそろ` uses visit cadence. The first release sends no push/email notifications.

## Plans/settings
Plan screen explains Free/Pro value without exposing Business purchase. Pro target display price is 990 JPY/month; entitlement never derives from UI price text. Settings exposes the `そろそろ` toggle and clearly states that reminders are display-only.

## Mobile/accessibility
- large touch targets
- safe-area-aware bottom controls
- iOS form fields avoid unwanted zoom
- Escape closes drawer on keyboard-capable devices
- active navigation exposes `aria-current`
- avoid modal chains
- keyboard must not cover the primary Capture confirmation action
- empty/error states must offer a useful next action
