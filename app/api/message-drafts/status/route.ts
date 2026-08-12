import { NextResponse } from "next/server";
import { getMessageDraftStatus } from "@/lib/message-draft";

export async function GET() {
  const status = getMessageDraftStatus();
  return NextResponse.json({
    appName: "velvet",
    operation: "MessageDraft.Generate",
    contract: "approved",
    configured: status.configured,
    endpoint: status.endpoint,
    sourceApp: status.sourceApp,
    targetStudio: status.targetStudio,
    status: status.configured ? "success" : "warning",
    issues: status.configured ? [] : ["SNS_PLANNER_BASE_URL_NOT_CONFIGURED"],
    timestamp: new Date().toISOString(),
  });
}
