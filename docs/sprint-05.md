# Sprint 05 — Schedule, Gift, Self-investment, Plan Enforcement

## Goal
Complete the remaining v1.0 functional surfaces without adding unnecessary top-level navigation.

## Scope

### Schedule
- month/list hybrid mobile view
- user schedule entries: shift, day off, event, accompaniment, appointment, self-investment
- person-related schedule entries: planned visit, birthday, travel/business trip, unavailable weekday/time, custom event
- create from Schedule directly
- create candidate from Capture after confirmation
- no proactive sales-task generation

### Gift
- received / given direction
- item, date, occasion, optional value, memo
- Pro image attachment only
- person-context quick action
- recent/frequent gift suggestions
- timeline integration

### Self-investment
- date, category, amount, optional memo
- categories: beauty, fashion, photography/content, learning, maintenance, other
- quick-entry amount suggestions
- Capture candidate support
- no tax/accounting claims

### Free / Pro enforcement
Free:
- People unlimited
- rolling 1-year visible history for Visit, Gift, Knowledge and applicable timeline data
- no server image upload
- AI points purchasable at higher unit price
- import/export available

Pro:
- full historical access
- image upload/retention within product limits
- advanced eligible search/analysis
- SNS Planner eligible integration
- AI points at lower unit price

## Acceptance criteria
1. Schedule can be used without AI.
2. Gift can be recorded from a person in <=3 taps when a suggested item is correct.
3. Self-investment can be recorded with category + amount and no mandatory memo.
4. Free users cannot retrieve protected historical detail older than one year through alternate endpoints.
5. Free users cannot upload images by bypassing UI.
6. Pro users see full authorized history.
7. Plan checks are server-side and covered by tests.
8. No "today you should contact..." recommendation is introduced in this sprint.
