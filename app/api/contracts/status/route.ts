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
    supportsVelvetProfessionalApp: true,
    ownsCustomerMaster: false,
    ownsPaymentSourceOfTruth: false,
    ownsSalesSourceOfTruth: false,
    ownsProfessionalVisit: true,
    ownsProfessionalMemory: true,
    ownsProfessionalTimeline: true,
    supportsMessageDraftReferences: true,
    supportedOperations: [
      "VelvetVisit.Start",
      "VelvetVisit.Complete",
      "VelvetMemory.Get",
      "VelvetMemory.Update",
      "VelvetNote.Create",
      "VelvetTimeline.List",
      "VelvetNextAction.Create"
    ],
    stableEvents: [
      "velvet.visit.started.v1",
      "velvet.visit.completed.v1",
      "velvet.memory.updated.v1",
      "velvet.note.created.v1",
      "velvet.next_action.created.v1"
    ],
    deniedCrossAppFields: [
      "Customer master records",
      "paymentStatus",
      "salesAmount",
      "Stripe data",
      "Payment records",
      "Sales records",
      "full professional note bodies",
      "full professional memory bodies",
      "full conversation histories",
      "API keys",
      "secret prompts"
    ],
    issues: [],
    timestamp: new Date().toISOString()
  });
}
