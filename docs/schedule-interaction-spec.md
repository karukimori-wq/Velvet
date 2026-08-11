# Velvet Schedule Interaction Specification v1.0

## Principle
Schedule is a convenience surface, not a task manager that dictates sales behavior.

## Views
- Default mobile view: near-term agenda/list with date grouping
- Optional month selector for navigation
- Person-related events show the related person compactly

## Create flow
1. Tap add.
2. Choose a quick type or enter short text.
3. Date/time defaults to the currently selected context where appropriate.
4. Person association is optional.
5. Save occurs with the minimum required data.

## Quick types
User:
- shift
- day_off
- event
- accompaniment
- appointment
- self_investment
- other

Person-related:
- planned_visit
- birthday
- travel
- business_trip
- unavailable
- custom

## Capture integration
A user-triggered Capture organization may propose a ScheduleEntry. Example: `山田さん 来週木曜 20時` -> candidate planned visit. The candidate is not committed until confirmed.

## Unknown/rough dates
Allow partial information when useful, such as a date without time. Do not force precision the user does not know.

## No proactive coaching
Schedule may display recorded events and dates. It must not transform them into unsolicited sales commands or foreground "you should contact" actions.
