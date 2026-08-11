# Velvet UX Specification v1.0

## North star
Reduce user operation before adding functionality. Velvet should feel useful because it removes work, not because it advertises AI.

## Interaction hierarchy
Prefer: deterministic automatic values -> person-specific suggestions -> user learned values -> quick stamps/chips -> voice -> short text -> full form fallback.

## AI
AI processing is user-triggered. Uncertain inferred changes are not silently committed. Capture organization shows a compact candidate summary for confirmation/correction. Avoid foreground AI branding where a plain product verb communicates the value.

## Visit
From a person: tap Visit, current timestamp becomes arrival; active visit exposes minimum frequent actions; End sets departure and duration. Sales/payment/memo/context are not required to end.

## Suggestions
Rank, do not auto-commit. Person-specific recurring values outrank user-level learned values, which outrank defaults. Always allow Other/new value.

## Multi-person visits
Create one shared visit and add participants. Shared data is entered once. Relationship labels are optional; co-visit history is factual and does not imply friendship/family/company relationships.

## Capture
Available from frequent contexts without navigating to category forms. Stamps, suggestions, text and voice share the same Capture model. After user-triggered organization, show proposed changes and one primary confirmation action.

## Search
Simple search first. Quick chips/recent searches may reduce typing. Natural-language retrieval is user-triggered and may consume AI points.

## Error philosophy
Incomplete records are valid. Failed AI organization preserves raw Capture. Retry must not require re-entry. Prefer Undo for immediately persisted quick actions.

## Mobile
Responsive smartphone support is mandatory. Frequent actions need thumb reach, large targets and short sessions. Desktop is secondary.
