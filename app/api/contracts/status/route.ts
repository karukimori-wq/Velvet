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
      velvetVisit: true, velvetMemory: true, velvetNote: true, velvetTimeline: true, velvetNextAction: true,
      customer: false, reservation: false, payment: false, sales: false, snsMessageDraft: false,
      communicationPerson: false, conversation: false, message: false, conversationContext: false, replyDraft: false, safetyCheck: false, communicationSendWorkflow: false,
      feedbackConversation: false, feedbackMessage: false, feedbackAnalysis: false, feedbackIssue: false,
      aiActivity: false, aiUsage: false, aiCapability: false
    },
    supportedApiOperations: ["VelvetVisit.Start","VelvetVisit.Complete","VelvetMemory.Get","VelvetMemory.Update","VelvetNote.Create","VelvetTimeline.List","VelvetNextAction.Create","VelvetHandoff.Start","Feedback.Submit"],
    supportedEndpoints: ["POST /api/visits","PATCH /api/visits/{visitId}","GET /api/customers/{customerId}/memory","PATCH /api/customers/{customerId}/memory","POST /api/customers/{customerId}/notes","GET /api/customers/{customerId}/timeline","POST /api/customers/{customerId}/next-actions","GET /api/feedback","POST /api/feedback"],
    supportedEvents: ["velvet.visit.started.v1","velvet.visit.completed.v1","velvet.memory.updated.v1","velvet.note.created.v1","velvet.next_action.created.v1"],
    acceptedReferences: ["workspaceId","userId","customerId","reservationId","visitScheduleId","traceId","correlationId"],
    returnedReferences: ["visitId","noteId","lastVisitAt","summaryRef","nextActionRef","traceId","correlationId","requestId"],
    aiPlatformCoreCapabilities: [
      { operation:"VelvetCapture.Structure", capability:"velvet.capture.structure", targetApp:"ai-platform-core", canonicalOwner:"velvet", mode:"user_triggered_reference_minimized" },
      { operation:"VelvetSearch.ParseIntent", capability:"velvet.search.parse_intent", targetApp:"ai-platform-core", canonicalOwner:"velvet", mode:"user_triggered_reference_minimized" }
    ],
    feedbackHubBoundary: {
      targetApp:"feedback-hub", canonicalOwner:"feedback-hub", operation:"Feedback.Submit",
      velvetOwns:["feedbackLauncherUI","screenContext"],
      feedbackHubOwns:["FeedbackConversation","FeedbackMessage","AIAnalysis","Issue","similarityMerge","priority","ranking","urgentNotification"],
      allowedPayload:["appId","appName","workspaceId","userId","ownerUserId","route","screenName","appVersion","device","browser","occurredAt","initialMessage","minimalReferenceContext"],
      prohibitedPayload:["fullProfessionalMemoryBody","fullProfessionalNoteBody","fullNotes","fullConversationHistory","CustomerMaster","Payment","Sales","StripeData","APIKeys","secretPrompts"],
      endpoints:["GET /api/embed/config?appId=velvet","POST /api/embed/feedback","POST /api/feedback/intake"],
      referenceOnly:true
    },
    simpleMessageDraftIntegration: { targetApp: "sns-planner", owner: "sns-planner", operation: "MessageDraft.Generate", scope: "simple_business_initiated_contact_without_live_conversation_context_or_send", referenceOnly: true },
    communicationPlannerBoundary: {
      targetApp: "communication-planner", canonicalOwner: "communication-planner",
      owns: ["CommunicationPerson","ChannelIdentity","Conversation","Message","ConversationContext","Topic","Promise","CommunicationNextAction","ReplyDraft","SafetyCheck","sendWorkflow"],
      velvetOwns: ["ProfessionalMemory","ProfessionalVisit","ServiceNote","ConversationNote","ProfessionalTimeline","ProfessionalRecall"],
      velvetMustNotDuplicate: ["Conversation","Message","ConversationContext","ReplyDraft","SafetyCheck","sendWorkflow"],
      allowedHandoffReferences: ["workspaceId","userId","customerId","personId","conversationId","purpose","inputRef","traceId","correlationId"],
      referenceOnly: true, safetyCheckBeforeSend: true
    },
    prohibitedCrossAppFields: ["Customer master records","Payment records","Sales records","paymentStatus","salesAmount","Stripe data","fullProfessionalNoteBody","fullProfessionalMemoryBody","fullNotes","fullConversationHistory","fullConversationContextBody","API keys","access tokens","secret prompts"],
    issues: [], timestamp: new Date().toISOString()
  });
}
