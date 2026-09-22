# External Intelligence development integration

Velvet uses External Intelligence System (EIS) only as development intelligence. EIS is not a runtime dependency and does not own Velvet customer, visit, memory, note, next-action, or media data.

## Development start

At the start of a development task, a connected development agent should call EIS `development_start` through HTTP or MCP with:

- `appId`: `velvet`
- `componentId`: `web`
- `projectId`: `Velvet`
- `repository`: `karukimori-wq/Velvet`
- current repository HEAD
- a concise description of the current task

The returned Project Snapshot, proven patterns, and known failures should be reviewed before implementation. Shared Knowledge updates must invalidate stale context even when Velvet's own repository HEAD is unchanged.

If EIS communication does not succeed, report `External Intelligence: NOT CONNECTED` and continue development without claiming EIS Knowledge was used.

## Production workflow result recording

`.github/workflows/external-intelligence-production-result.yml` listens for successful completion of the `Cloudflare Production` workflow and records the exact source commit from `workflow_run.head_sha`.

Repository configuration required for recording:

- Repository Variable `EXTERNAL_INTELLIGENCE_BASE_URL`
- Repository Variable `EXTERNAL_INTELLIGENCE_WORKSPACE_ID`
- Repository Secret `EXTERNAL_INTELLIGENCE_TOKEN`

Missing EIS configuration or an EIS outage does not fail Velvet Production deployment.

The automated result records the Production API/persistence evidence that the workflow actually checks: public endpoints, D1 readiness and roundtrip, workspace isolation, Professional Memory flow, and R2 lifecycle. It remains `implementation_result` because intended-user UI reachability and human verification are not established by that workflow.

## Production success rule

Do not promote a result to `production_verified_success` solely from CI Green or API E2E. When applicable, verify the intended user can reach and operate the feature from the current Production UI, with correct role/plan behavior, persistence/readback, required integrations, and human-visible behavior.
