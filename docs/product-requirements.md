# Velvet Product Requirements v1.1

## 1. Product
**Name:** Velvet  
**Positioning:** 夜職専用営業アシスタント  
**Platform role:** Growth Engine と連携する Professional App

Velvet is for adult professionals, business operators, and store operators in cabaret clubs, host clubs, lounges, girls bars, concept cafes and related night-work formats.

Velvet is the professional memory and service-quality layer. Growth Engine is the canonical Business layer for Customer, Reservation, Payment and Sales.

## 2. Core outcome
Velvet first optimizes convenience and recall: remember the customer quickly, preserve service context, and reduce input effort. Business plan features then connect that professional memory to Growth Engine so visits, sales and repeat business can be improved without making Velvet a competing CRM or sales ledger.

Velvet must not make proactive sales coaching the default home experience. Recommendations are user-invoked or Business-context features and must not become intrusive daily instructions.

## 3. Responsibility boundary

### Velvet owns
- Visit history as professional/service history
- Service notes
- Preferences
- Cautions / NG topics
- Conversation notes
- Previous handling / previous service context
- Next-topic / next-contact memo
- Customer-specific professional timeline
- Capture raw input and user-confirmed structured professional memory
- Velvet-specific suggestion/dictionary state
- Input-complete-only customer recall UI

### Velvet does not own
- Customer master
- Payment source of truth
- Sales source of truth
- Reservation source of truth
- `paymentStatus`
- `salesAmount`
- Stripe secrets or Stripe payment credentials
- Canonical cross-business sales analytics

### Canonical owner
Growth Engine owns:
- Customer
- Reservation / Visit Schedule
- Payment
- Sales / Revenue
- customer-level canonical sales aggregation
- repeat / referral / contact-measure Business state

Velvet may keep `customerId`, `reservationId` or `visitScheduleId` as references. It must not create a competing canonical Customer, Payment, Sales or Reservation record.

## 4. Primary areas
1. Customer Recall / People view
2. Visit
3. Capture
4. Search
5. Schedule / Business handoff

Gifts, relationships, self-investment and AI are embedded rather than separate top-level products.

## 5. Customer recall
A Velvet customer view is a professional-app projection keyed by Growth Engine `customerId` where platform integration is active. Velvet may retain only the professional memory needed for its role plus minimal display/cache fields allowed by contract.

Support optional professional memory such as interests, preferences, favorite drinks/food, smoking preference, NG topics, referrals and relationships.

### Remembered personal context
Velvet may retain user-entered or user-confirmed memory such as:
- appearance: hairstyle, hair color, clothing/style, facial characteristics, glasses and other useful distinguishing features
- accessories/belongings: watch presence, watch brand/model when known, wallet brand, jewelry and other accessories
- marital status: `unmarried`, `married`, `unknown`

These fields are optional and should be easy to enter through Capture/stamps/suggestions rather than a mandatory profile form. AI must not infer sensitive or uncertain personal attributes from appearance without explicit user input/confirmation.

### Recall UI rule
The customer confirmation screen must display only fields that contain data. Empty labels, empty cards and `未入力` placeholders must not make the page longer.

Priority order:
1. identity/minimum display information
2. previous recall summary
3. personality / preferences / cautions
4. quick actions
5. professional timeline

The target experience is to restore important customer context within roughly 10 seconds before service.

## 6. Visit
Velvet owns the professional visit/service history, including where available:
- visit date
- arrival
- departure
- calculated duration
- participants / service context
- seating reason
- visit context
- service notes
- conversation notes
- gifts
- nomination/service context where useful to professional memory

Starting a visit records current time. Ending records departure and calculates duration. Unknown departure time is valid. Detailed fields are optional.

Canonical reservation or visit-schedule state remains in Growth Engine. If a Velvet visit originates from Growth Engine, retain only the reference such as `reservationId` or `visitScheduleId`.

### Sales and payment prohibition
Velvet must not persist canonical `salesAmount`, `paymentStatus`, Payment or Sales records. Business-plan customer sales and sales trends are obtained from Growth Engine by reference/query and displayed as Business information without becoming Velvet's source of truth.

Stripe secrets, payment credentials and unnecessary payment payloads must never be sent to Velvet.

## 7. Multi-person visits and relationships
Use one shared professional visit record with multiple participant references where appropriate; shared service context is entered once. Co-visits may inform suggestions but must not assert a real-world relationship without user confirmation.

Relationship notes are professional memory, not a replacement for Growth Engine Customer master data.

## 8. Visit context and seating reason
Examples of visit context: solo, friends, business, entertainment/接待, accompaniment/同伴, group, other.

Seating reason is visit/seat context, not a permanent customer attribute. It is optional and should be one-tap where possible. Examples:
- new guest / 新規
- nomination / 指名
- in-store nomination / 場内指名
- help for another cast member / ○○のヘルプ
- accompaniment / 同伴
- free/rotation / フリー・回転
- other

Previously used labels should become suggestions.

## 9. Gifts
Track both received and given gifts as professional memory: item, date, occasion, optional memo, and plan-eligible image. Reuse frequent/recent gift types as suggestions.

## 10. Capture
Universal low-friction input via stamps, learned suggestions, short text and voice. User-triggered AI may turn Capture into candidate professional memory, visit note, gift, relationship or schedule memo. Inferred changes require lightweight confirmation before commit.

Conversation notes belong to the professional timeline. Stable remembered facts belong to customer professional memory. AI produces candidates; it must not silently overwrite canonical data.

## 11. Personal dictionary
Values entered once can appear as candidates elsewhere. Ranking order: customer-specific history, user frequency/recency, application defaults. The purpose is to reduce taps and repeated typing.

## 12. Search
Support customer reference/display search, keyword retrieval, quick chips/stamps and user-triggered natural-language search where available. Retrieval includes preferences, hobbies, appearance/accessory memories, cautions, gifts, visit/seating context, co-visits and professional historical information within the plan's accessible window.

## 13. Schedule
Velvet may retain professional schedule memos and references. Canonical Reservation / Visit Schedule belongs to Growth Engine.

Business-plan scheduled-visit experiences should read Growth Engine references rather than create an independent canonical reservation system inside Velvet.

## 14. Self-investment
Lightweight records only: date, category, amount, optional memo. Categories may include beauty, fashion, photography/content, learning and maintenance. This is not accounting or tax software.

## 15. Contact-loss protection
Initial scope provides user-controlled contact backup/professional memory where contractually allowed. Automated LINE conversation synchronization, BAN circumvention and automatic cross-platform messaging are out of scope.

## 16. Import/export
Support JSON bulk import for Velvet-owned professional memory. Do not import a competing Customer master, Payment ledger, Sales ledger or Reservation ledger into Velvet.

Settings may expose copyable import-generation instructions and the current JSON schema so users can transform existing professional notes with an external AI, then validate, preview and import JSON. Do not automatically send source spreadsheets to AI Platform Core.

## 17. Plan value

### Pro — JPY 10,000/month
**Value:** 顧客を忘れない・接客品質を上げる。

Pro features:
- customer profile / professional recall projection
- input-complete-only display
- customer quick card
- professional timeline
- visit history
- service notes
- preferences / cautions
- conversation notes
- previous handling
- next-contact memo / next-topic memo
- AI memo organization
- AI reply / contact-message drafts
- customer search
- important-customer pinning

Core Pro outcomes:
- remember important customer information within about 10 seconds before service
- never lose the context of what was discussed last time
- improve consistency and quality of customer-specific service

Pro is not justified by sales analytics. Its primary paid value is memory, recall and service quality.

### Business — JPY 30,000/month
**Value:** 来店・売上・リピートを増やす。

Business unlocks Growth Engine-powered business mode. Business features may include:
- planned-visit management
- customer-level sales view
- sales trends
- visit-interval analysis
- repeat-visit candidate list
- priority-response list
- user-invoked / Business-context contact candidates
- dormant-customer list
- referral management
- sales dashboard
- contact-measure management
- SNS Planner integration
- AI sales suggestions

Core Business outcomes:
- move from recording memory to understanding what action may lead to the next visit or sale
- visualize visits, sales and repeat behavior
- connect Velvet professional context with Growth Engine Business data without duplicating its canonical records

Business features that use Customer / Reservation / Payment / Sales data must use Growth Engine as the source of truth.

## 18. Growth Engine integration contract

### Growth Engine -> Velvet
Reference-first input:
- `workspaceId`
- `userId`
- `customerId`
- `reservationId` or `visitScheduleId`
- `intent`

Do not send `paymentStatus`, `salesAmount`, Stripe secrets, payment credentials or unrelated business payloads unless a future explicit contract demonstrates a minimum necessary use. Default is not to send them.

### Velvet -> Growth Engine
Reference-first output where needed:
- `visitId`
- `noteId`
- `lastVisitAt`
- `nextActionRef`
- `summaryRef`

Velvet must not return raw confidential service-note text or full conversation notes merely because a reference exists. Growth Engine receives references/summaries only when required by the contracted workflow.

### Privacy rule
Professional notes, cautions, conversation details and customer-specific memory remain Velvet-owned professional data. Cross-app payloads must be minimum necessary and reference-ID centered.

## 19. AI and SNS integration
AI Platform Core owns AI runtime and AI Usage. Velvet uses user-triggered AI capabilities and sends only the minimum scoped input required.

SNS Planner owns post-draft creation. Business strategy, sales/repeat decisions and campaign intent belong to Growth Engine. Velvet may hand off intentionally selected professional context only when the user explicitly invokes the workflow.

## 20. Out of scope / prohibited ownership
Velvet is not:
- a competing Customer master
- a Payment ledger
- a Sales/Revenue ledger
- a Stripe integration owner
- a canonical Reservation system
- a POS replacement
- payroll software
- tax filing software
- AI Usage source of truth
- cross-app monitoring source of truth

## 21. Definition of Done
- Pro JPY 10,000 value is explicitly `顧客を忘れない・接客品質を上げる`.
- Business JPY 30,000 value is explicitly `来店・売上・リピートを増やす`.
- Velvet does not own Customer / Payment / Sales / Reservation canonical data.
- Velvet owns professional visit history, service notes and customer-specific professional timeline.
- Growth Engine integration is reference-ID centered.
- Confidential note bodies are not unnecessarily returned to Growth Engine.
- `paymentStatus`, `salesAmount` and Stripe secrets are not unnecessarily sent from Growth Engine to Velvet.
