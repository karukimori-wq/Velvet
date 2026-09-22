# Velvet Analytics

Velvet supports a privacy-safe analytics layer for product-flow measurement.

The first release only emits sanitized screen names. It must not emit customer
names, contact details, raw notes, Capture text, customer IDs, payment data,
sales data, image data, or full URLs.

## Providers

Set `NEXT_PUBLIC_VELVET_ANALYTICS_PROVIDER`:

- `disabled` - default, sends nothing
- `posthog` - sends `$pageview` with `{ app: "velvet", screen, privacy: "screen_only" }`
- `clarity` - loads Microsoft Clarity and sets the sanitized `screen` tag

PostHog requires:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

Clarity requires:

- `NEXT_PUBLIC_CLARITY_PROJECT_ID`

## Screen Names

Dynamic routes are normalized before analytics emission. For example:

- `/people/<id>` -> `customer_detail`
- `/people/<id>/message` -> `message_draft`
- `/people/<id>/history/<id>` -> `history_detail`
- `/capture/organize/<id>` -> `capture_organize`

This keeps analytics useful for UX improvement while avoiding private route or
record identifiers.

## Guard

`npm run check:privacy-cache` verifies that the analytics component does not
read query strings, emit raw URLs, or mention private field names.
