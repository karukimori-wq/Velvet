# Velvet Component Guidance v1.0

Current implementation is authoritative; prefer existing shared components and scoped CSS over creating parallel design systems.

## Core shared surfaces
- `AppHeader`: Velvet/page title, drawer, current-route state, Plan/Settings access
- `BottomNav`: Home / お客様 / 覚える / 予定, with Capture emphasized
- customer row: identity + recall context + direct `＋ 覚える`
- customer detail quick actions: 覚える / 思い出す / 次につなぐ / 予定
- Capture composer: stamps/suggestions/text and Pro voice
- Capture review: candidate selection/edit/confirm without losing raw input
- timeline/history rows: Pro integrated timeline; Free event-by-event access inside policy window
- next-action controls: Pro text + optional due date, display-only reminder state
- media controls: Pro upload/view/delete through authorized API routes
- retention/plan gate: explain locked capability without implying retained data was deleted

## Rules
- no AmountPicker/Payment picker in Velvet Free/Pro; Growth Engine owns Sales/Payment truth
- no AI point-balance component until an approved point-wallet/purchase contract exists
- no visible customer pinning dependency
- minimum touch targets and safe-area-aware controls
- hide unknown customer fields instead of rendering placeholder rows
- preserve text/Capture drafts when interrupted where practical
- avoid nested modal flows
- learned suggestions may reorder choices but never silently commit uncertain values
