# Velvet Product Requirements v1.0

## 1. Product
**Name:** Velvet  
**Positioning:** 夜職専用営業アシスタント

Target users are individual workers across cabaret clubs, host clubs, lounges, girls bars, concept cafes and related night-work formats. No store/operator dashboard is in v1.0.

## 2. Core outcome
Reduce effort required to remember people, record visits, retain relationship context, manage relevant schedules and retrieve information later. Proactive sales coaching is not the home focus.

## 3. Primary areas
1. People
2. Visit
3. Capture
4. Search
5. Schedule

Sales, gifts, relationships, self-investment and AI are embedded rather than separate top-level products.

## 4. People
A person may be created with a name only; all other fields are optional. Support birthday/age range, phone/email, LINE/Instagram/X/TikTok/other contacts, occupation/company/area, user-defined rank, interests, preferences, favorite drinks/food, smoking preference, NG topics, referrals and relationships.

### Remembered personal context
Velvet may retain user-entered or user-confirmed memory such as:
- appearance: hairstyle, hair color, clothing/style, facial characteristics, glasses and other useful distinguishing features
- accessories/belongings: watch presence, watch brand/model when known, wallet brand, jewelry and other accessories
- marital status: `unmarried`, `married`, `unknown`

These fields are optional, private to the owner, searchable where appropriate, and should be easy to enter through Capture/stamps/suggestions rather than a mandatory profile form. AI must not infer sensitive or uncertain personal attributes from appearance without explicit user input/confirmation.

Free stores no images; Pro may store profile, business-card, gift and other images.

## 5. Visit
Where available record date, arrival, departure, calculated duration, participants, visit context, sales amount, payment method, receivable/売掛 metadata, nomination/指名, bottle/drink/food notes, accompaniment/同伴, after-hours activity, seating reason and Capture entries.

Starting a visit records current time. Ending records departure and calculates duration. Unknown departure time is valid. Detailed fields are optional.

### Multi-person visits
Use one shared visit with multiple participants; shared data is entered once. Co-visits may inform suggestions but must not assert a real-world relationship without user confirmation.

### Visit context
Examples: solo, friends, business, entertainment/接待, accompaniment/同伴, group, other.

### Seating reason
Seating reason is visit/seat context, not a permanent Person attribute. It is optional and should be one-tap where possible. Examples:
- new guest / 新規
- nomination / 指名
- in-store nomination / 場内指名
- help for another cast member / ○○のヘルプ
- accompaniment / 同伴
- free/rotation / フリー・回転
- other

For `help`, optionally store a short label or reference describing whose help it was. Previously used labels should become suggestions.

### Payment
Examples: cash, card, QR/payment app, receivable/売掛, other. Suggestions may be ranked from history but are not silently committed.

## 6. Gifts
Track both received and given gifts: item, date, occasion, optional estimated value, memo, and Pro-only image. Reuse frequent/recent gift types as suggestions.

## 7. Capture
Universal low-friction input via stamps, learned suggestions, short text and voice. User-triggered AI may turn Capture into candidate person knowledge, visit, gift, relationship or schedule updates. Inferred changes require lightweight confirmation before commit. The user does not choose destination fields before Capture.

Capture should support the remembered context above, e.g. `髪色 黒`, `メガネ`, `時計 ロレックス`, `財布 ルイヴィトン`, `既婚`, or a seating reason such as `田中さんのヘルプ` with minimal taps.

## 8. Personal dictionary
Values entered once can appear as candidates elsewhere. Ranking order: person-specific history, user frequency/recency, application defaults. Includes occupations, hobbies, drinks, bottles, gift types, payment methods, visit contexts, seating reasons, appearance descriptors, accessory/brand values and common amounts.

## 9. Search
Support name/contact search, keyword retrieval, quick chips/stamps and user-triggered natural-language search where available. Retrieval includes preferences, hobbies, appearance/accessory memories, marital-status value, gifts, visit/seating context, co-visits and historical information within the plan's accessible window.

## 10. Schedule
User examples: shifts, days off, events, accompaniment, appointments, self-investment appointments. Person examples: planned visit, birthday, travel/business trip, known unavailable weekdays/time windows and user-recorded events. Capture may create schedule candidates after confirmation.

## 11. Self-investment
Lightweight records only: date, category, amount, optional memo. Categories may include beauty, fashion, photography/content, learning and maintenance. This is not accounting or tax software.

## 12. Contact-loss protection
v1.0 provides contact backup inside Velvet. Automated LINE conversation synchronization, BAN circumvention and automatic cross-platform messaging are out of scope.

## 13. Import/export
Support JSON bulk import. Settings exposes copyable import-generation instructions and the current JSON schema so users can transform Excel/CSV/other existing data with an external AI, then validate, preview and import JSON. Do not automatically send the source spreadsheet to AI Platform Core. Users can export their own data on both plans.

## 14. Plans
### Free
- People unlimited
- core Capture/stamps/suggestions
- basic search
- visit/sales/gift/memory historical access: rolling 1 year
- images unavailable
- JSON import/export
- AI points purchasable at higher unit price

Historical records outside the visible Free window should be archived rather than destructively deleted where storage policy permits. Exact retention/storage policy must be defined before production.

### Pro
- target JPY 10,000/month
- People unlimited
- full historical access
- images
- advanced search/analysis where implemented
- eligible SNS Planner integration
- AI points purchasable at lower unit price

AI remains point-metered.

## 15. Out of scope v1.0
Store/operator dashboard, POS replacement, payroll, staff/customer sharing mesh, ranking/gamification, proactive daily sales coaching as home focus, health/sleep/alcohol tracking, tax filing, escrow/payment processor and automatic cross-channel messaging.
