export async function GET() {
  return Response.json({
    appName: "velvet",
    status: "success",
    contractVersion: "0.1.0",
    identityMode: "workspaceId+userId",
    professionalIdRequired: false,
    usesLegacyEventNames: false,
    usesReportTerminology: true,
    canonicalOwnershipChecked: true,
    sourceOfTruth: {
      velvetVisit: true,
      velvetMemory: true,
      velvetNote: true,
      velvetTimeline: true,
      velvetNextAction: true,
      messageDraft: false,
      customer: false,
      reservation: false,
      payment: false,
      sales: false,
      aiActivity: false,
      aiUsage: false,
      aiCapability: false
    },
    supportedApiOperations: [
      "VelvetVisit.Start",
      "VelvetVisit.Complete",
      "VelvetMemory.Get",
      "VelvetMemory.Update",
      "VelvetNote.Create",
      "VelvetTimeline.List",
      "VelvetNextAction.Create",
      "VelvetHandoff.Start"
    ],
    supportedEndpoints: [
      "POST /api/visits",
      "PATCH /api/visits/{visitId}",
      "GET /api/customers/{customerId}/memory",
      "PATCH /api/customers/{customerId}/memory",
      "POST /api/customers/{customerId}/notes",
      "GET /api/customers/{customerId}/timeline",
      "POST /api/customers/{customerId}/next-actions"
    ],
    supportedEvents: [
      "velvet.visit.started.v1",
      "velvet.visit.completed.v1",
      "velvet.memory.updated.v1",
      "velvet.note.created.v1",
      "velvet.next_action.created.v1"
    ],
    acceptedReferences: [
      "workspaceId",
      "userId",
      "customerId",
      "reservationId",
      "visitScheduleId",
      "traceId",
      "correlationId"
    ],
    returnedReferences: [
      "visitId",
      "noteId",
      "lastVisitAt",
      "summaryRef",
      "nextActionRef",
      "traceId",
      "correlationId",
      "requestId"
    ],
    aiPlatformCoreCapabilities: [
      {
        operation: "VelvetCapture.Structure",
        capability: "velvet.capture.structure",
        targetApp: "ai-platform-core",
        canonicalOwner: "velvet",
        mode: "user_triggered_reference_minimized"
      },
      {
        operation: "VelvetSearch.ParseIntent",
        capability: "velvet.search.parse_intent",
        targetApp: "ai-platform-core",
        canonicalOwner: "velvet",
        mode: "user_triggered_reference_minimized"
      }
    ],
    messageDraftIntegration: {
      sourceApp: "velvet",
      targetApp: "sns-planner",
      owner: "sns-planner",
      operation: "MessageDraft.Generate",
      events: [
        "sns.message_draft.created.v1",
        "sns.message_draft.updated.v1"
      ],
      referenceOnly: true
    },
    prohibitedCrossAppFields: [
      "Customer master records",
      "Payment records",
      "Sales records",
      "paymentStatus",
      "salesAmount",
      "Stripe data",
      "fullProfessionalNoteBody",
      "fullProfessionalMemoryBody",
      "fullConversationHistory",
      "API keys",
      "access tokens",
      "secret prompts"
    ],
    issues: [],
    timestamp: new Date().toISOString()
  });
}
