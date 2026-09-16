# Velvet Design System v1.0

## Character
Refined, warm, private and calm. Velvet should feel like a personal professional notebook with restrained luxury, not a nightclub dashboard and not an AI console.

## Current visual direction
The current Free/Pro release uses a light ivory/rose surface with wine/bordeaux accents. Existing `app/velvet-theme.css`, `app/ux-polish.css` and scoped surface CSS are the implementation baseline.

- ivory/off-white page background
- wine/bordeaux primary action and active state
- pale rose secondary emphasis
- soft borders/shadows rather than heavy cards
- serif accent for Velvet/logo/headline moments; readable Japanese system sans for controls/body
- restrained gradients only where they support hierarchy

Do not independently introduce a dark/neon/nightclub visual system during current release polishing. A future dark mode should be designed as a complete theme rather than piecemeal overrides.

## Layout
- mobile-first, current shell max width around phone/tablet content width
- bottom navigation is safe-area aware
- Capture is the emphasized central action
- customer detail is a single vertical recall surface
- frequent actions stay thumb reachable

## Shape/motion
Use moderately rounded cards/controls and short functional transitions. Avoid decorative loading, modal chains and motion that slows Capture.

## Privacy
Top-level/list surfaces show only the customer context needed to identify/recall the person. Avoid long private notes/contact details in app-switcher-visible surfaces.

## AI presentation
AI-assisted organization/search should look like ordinary Velvet workflow. Do not create a special glowing/robot visual language or a point-balance UI without an approved point contract.

## Accessibility
- readable Japanese text sizes
- large touch targets
- state not encoded by color alone
- visible focus/current navigation state
- respect reduced motion where practical
- primary Capture controls remain usable around the mobile keyboard
