# Velvet media storage

## Release scope

Customer image attachments are a Pro feature. Free users do not receive upload, retrieval, or integrated media access. Business remains unavailable for purchase in the current release scope.

## Storage and ownership

- Image bytes are stored in the Cloudflare R2 `MEDIA` binding (`velvetmedia`).
- Object keys are scoped under `workspaceId / userId / customerId`.
- Upload requires an existing Velvet customer-memory record in the same workspace/user scope.
- A successful upload creates a `media` professional-timeline item whose `sourceRef` is `r2:<object-key>`.
- Retrieval requires the current Pro entitlement, an exact workspace/user/customer key scope, and a matching `media` timeline reference. A key prefix alone is not sufficient authorization.
- R2 objects are not public-read objects; retrieval is served through the authenticated Velvet media endpoint.

## Upload validation

Accepted declared types are JPEG, PNG, WebP, and GIF, up to 10 MB. Velvet also validates the leading file bytes against the declared image type. A file whose declared MIME type does not match its image signature is rejected before R2 storage.

If R2 storage succeeds but timeline registration fails, the uploaded object is deleted as compensation so a newly uploaded orphan object is not intentionally left behind.

## Deletion lifecycle

The authenticated media endpoint supports scoped deletion. Deletion uses the same entitlement, workspace/user/customer scope, and timeline-reference authorization as retrieval. Velvet deletes the R2 object and then removes the scoped timeline row. The UI removes the item only after the API confirms success.

Because R2 and D1 do not share a transaction, a failure after R2 deletion but before timeline deletion can temporarily leave a timeline reference whose object no longer exists. Retrying the deletion is safe because R2 deletion is treated as idempotent and the timeline deletion is scoped by identity and customer.

## Verification

`npm run check:media-access` statically guards the required upload validation, rollback, registered retrieval, scoped deletion, and non-public access markers. CI also runs typecheck and production build. Production E2E separately verifies the deployed R2 upload/retrieval flow; expand that E2E when lifecycle behavior changes.
