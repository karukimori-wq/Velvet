# Velvet Component Library v0.1

## Goal
Reusable components must reinforce Velvet's low-friction mobile UX. Prefer a small number of flexible components over many specialized forms.

## Core components

### BottomNav
Items: Home, Search, Capture, People, Schedule.

### QuickSearch
Persistent compact search entry used on Home and People.

### PersonRow
Compact row with optional photo/initials, name, rank, last visit, next planned visit.

### PersonHeader
Name, optional photo, rank, contact shortcuts.

### QuickActionBar
Thumb-reachable actions such as Visit, Capture, Gift, Schedule, More.

### ChipPicker
One-tap selectable values. Supports learned ordering, recent values, and Other.

### LearnedChipRow
Context-aware horizontal chips ranked by person-specific history, user history, then defaults.

### AmountPicker
Common/recent amount chips with Other -> numeric input fallback.

### ActiveVisitBar
Persistent active-visit status with participant names, start time, elapsed time, and End.

### TimelineItem
Unified event row for Visit, Gift, Knowledge, Schedule, Relationship and Capture-related records.

### CaptureComposer
Single capture surface supporting stamps, suggestions, text and voice.

### CandidateConfirmSheet
Compact list of AI-structured candidate changes. Supports confirm-all, remove item, edit item.

### GiftDirectionPicker
Received / Given first-step selector.

### PersonPicker
Fast multi-select people picker for group visits and relationship actions.

### ScheduleQuickAdd
Compact date/time/context entry with learned suggestions.

### UndoToast
Short-lived undo for immediately persisted quick actions.

### RetentionGate
Free-plan historical access message. Never imply data was deleted if it remains archived.

### PointBalanceBadge
Subtle AI-point balance indicator used only where useful; do not interrupt normal flow for routine consumption.

## Component rules
- Minimum touch target should follow modern mobile accessibility guidance.
- Components must support one-handed operation where used frequently.
- Avoid nested modal-on-modal interaction.
- Empty/unknown values should not render noisy placeholder rows.
- Learned suggestions are reorderable by the system but never silently selected.
- Any component requiring text input must preserve draft state on interruption.
