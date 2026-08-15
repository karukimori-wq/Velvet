# Responsibility Boundary Refactor Status

Status: `ready`

The responsibility-boundary refactor is complete at the application/code-contract level. Database migrations still need to be applied in each deployed environment through the normal deployment process, but legacy Customer/Sales/Payment-shaped stores are no longer product write targets.

## Canonical ownership

### Growth Engine is canonical for
- Customer
- Reservation / Visit Schedule
- Payment
- Sales
- paymentStatus / salesAmount
- customer sales totals, repeat/referral/business analytics

### Communication Planner is canonical for
- Communication Person projection and ChannelIdentity
- 1-to-1 Conversation / Message
- ConversationContext / Topic / Promise
- Communication NextAction
- conversation-contextual ReplyDraft
- SafetyCheck
- channel send workflow

### Velvet is canonical for
- customerId-scoped Professional Memory / Professional Profile
- Professional Visit record/history
- service / conversation notes created as professional memory
- preference / caution / previous-handling memory
- next-topic memo
- customer-specific professional timeline and Recall UI
- customerId-scoped Capture / Gift / relationship memory / self-investment

Velvet conversation notes are professional service memory. They are not Communication Planner Conversation or Message records.

## Communication Planner boundary

Velvet must not implement a competing 1-to-1 inbox, Conversation, Message, ConversationContext, ReplyDraft, SafetyCheck or channel-send source of truth.

When a Velvet workflow hands off to Communication Planner, the default payload is reference-first and may contain only what the contracted operation needs from:
- `workspaceId`
- `userId`
- `customerId`
- `personId` where already known
- `conversationId` where already known
- `purpose`
- `inputRef`
- `traceId`
- `correlationId`

Velvet must not send `paymentStatus`, `salesAmount`, Stripe data, Customer master records, full professional memory, full notes, unrelated full conversation histories, API keys, access tokens or secret prompts.

SNS Planner simple MessageDraft remains valid only for business-initiated contact drafts that do not require live ConversationContext, SafetyCheck or channel send. Conversation-contextual replies belong to Communication Planner.

## Completed implementation

- `velvet_customer_memories` is keyed by `workspace_id + user_id + customer_id` and stores only Velvet professional memory.
- `velvet_professional_visits` stores Professional Visit context only and has no canonical Sales/Payment fields.
- `velvet_professional_timeline`, Capture, Gift, Schedule and Relationship state are customerId-scoped.
- Customer creation/contact master writes are not canonical Velvet operations; display data comes from Growth Engine reference/projection paths.
- Active Visit UI has no Sales, Payment, paymentStatus, salesAmount, receivable or Stripe input.
- Growth Engine integration is reference-ID based.
- No Velvet canonical repository for Communication Planner Conversation, Message, ConversationContext, ReplyDraft or SafetyCheck exists.
- Velvet's existing SNS MessageDraft integration is treated as simple contact-draft generation only; it is not a live conversation reply/send workflow.
- `/contracts/status` explicitly reports Communication Planner ownership and Velvet non-ownership.

## Legacy migration / rollback structures

Historical `velvet_people`, `velvet_knowledge`, `velvet_visits`, participant/contact/profile tables and other pre-refactor personId records remain migration/rollback-only. Legacy Person/Visit write helpers are blocked. Historical migration SQL does not define current ownership.

## Forbidden fields / records in new Velvet canonical state

- `salesAmount` / `paymentStatus` / Payment / Sales / receivable state
- Stripe secrets or payment details
- Customer name/contact/rank as Velvet canonical master fields
- Communication Planner Conversation / Message / ConversationContext bodies
- ReplyDraft / SafetyCheck / channel-send canonical state
- full unrelated conversation histories
- API keys / access tokens / secret prompts

## Automated boundary guard

CI runs `npm run check:responsibility` before typecheck/build. It protects the Customer/Sales/Payment refactor. Communication Planner ownership is additionally declared in `/contracts/status` and this status document; the guard should continue to be expanded if a future Velvet-to-Communication transport is added.

## Definition of Done re-evaluation

| Requirement | Result |
| --- | --- |
| Velvet uses customerId-scoped professional records | PASS |
| Velvet does not own Customer / Payment / Sales | PASS |
| Recall UI / Timeline / Memo / Professional Visit retained | PASS |
| Legacy Customer/Visit master-shaped tables are read-only | PASS |
| Growth Engine integration is reference-first | PASS |
| Velvet Professional Memory and Communication Conversation remain separate | PASS |
| Velvet does not own Conversation / Message / ReplyDraft / SafetyCheck / send workflow | PASS |
| Communication Planner handoff contract is reference-first | PASS |
| `/contracts/status` exposes Communication Planner boundary | PASS |

## Final assessment

Responsibility-boundary refactor: `ready`.

Velvet remains canonical for Professional Memory / Visit / Notes / Timeline. Communication Planner is canonical for 1-to-1 Conversation / Message / ReplyDraft / SafetyCheck / send workflow. Cross-app sharing is minimum-necessary and reference-first.
