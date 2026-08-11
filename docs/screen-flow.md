# Velvet Screen Flow v1.0

## Primary navigation

Velvet uses five primary areas:

1. People
2. Visit
3. Capture
4. Search
5. Schedule

The navigation must remain shallow. Frequent actions should not require deep stacks.

## Home behavior

The initial view should prioritize convenience, not coaching.

Default content:

- today's planned visits
- quick people search
- active visit, if any
- quick access to Capture
- upcoming schedule items relevant to today

Do not foreground unsolicited sales recommendations.

## People flow

People list/search -> Person detail -> optional actions:

- start Visit
- open Capture scoped to the person
- view timeline/history
- edit minimal profile fields
- view relationships
- view gifts
- view schedules

Person creation requires name only.

## Visit flow

Person detail -> Visit -> current time stored as arrival.

Active Visit exposes quick actions:

- add participant
- sales amount
- payment method
- order/bottle/drink
- gift
- Capture
- visit context
- End

End -> current time stored as departure -> duration calculated.

No additional field is required to complete the visit.

## Multi-person Visit

Start Visit -> Add people -> one shared Visit.

Shared fields apply once. Person-specific values appear only when explicitly requested.

## Capture flow

Entry points:

- global Capture button
- Person detail
- active Visit
- Schedule context

Input methods:

- stamp
- learned suggestion
- text
- voice

Flow:

raw Capture -> optional user-triggered organize -> compact candidate preview -> confirm/edit/reject -> structured records committed.

If organization fails, preserve raw Capture.

## Search flow

Search opens directly to one input surface.

Supported quick paths:

- name/contact lookup
- recent searches
- suggestion chips
- user-triggered natural-language query

Search result -> Person/Visit/Gift/Knowledge/Schedule result -> open source context.

## Schedule flow

Schedule -> day/week/list view -> create via quick action or Capture.

User-related and person-related schedules can coexist, but the UI must make the subject clear.

## Settings

Settings includes:

- plan and AI point balance
- JSON import/export
- import-generation prompt/instructions
- image/storage information
- privacy/data controls
- integration settings

Settings must not become a prerequisite for normal use.
