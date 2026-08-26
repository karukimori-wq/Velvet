import { NextResponse } from "next/server";
import { getStorageMode } from "@/lib/storage/config";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const workspaceId = request.headers.get("x-workspace-id") ?? "ws_velvet_roundtrip";
  const userId = request.headers.get("x-user-id") ?? "user_velvet_roundtrip";
  const requestId = request.headers.get("x-request-id") ?? makeD1Id("req");
  const id = makeD1Id("roundtrip");

  if (getStorageMode() !== "d1") {
    return NextResponse.json({
      status: "warning",
      appName: "velvet",
      persistenceDriver: getStorageMode(),
      roundtripReady: getStorageMode() === "postgres",
      message: "D1 roundtrip is only available when VELVET_STORAGE_MODE=d1.",
      durationMs: Date.now() - startedAt
    });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ status: "error", appName: "velvet", persistenceDriver: "d1", roundtripReady: false, errorCode: "D1_NOT_CONFIGURED" }, { status: 503 });
  }

  await db.prepare("insert into velvet_roundtrip_checks (id, workspace_id, user_id, request_id) values (?, ?, ?, ?)").bind(id, workspaceId, userId, requestId).run();
  const row = await db.prepare("select id, workspace_id, user_id, request_id from velvet_roundtrip_checks where id = ? and workspace_id = ? and user_id = ? limit 1").bind(id, workspaceId, userId).first<{ id: string; workspace_id: string; user_id: string; request_id: string }>();
  const roundtripReady = row?.id === id && row.workspace_id === workspaceId && row.user_id === userId;

  return NextResponse.json({
    status: roundtripReady ? "success" : "error",
    appName: "velvet",
    persistenceDriver: "d1",
    roundtripReady,
    roundtripId: id,
    workspaceId,
    userId,
    requestId: row?.request_id ?? requestId,
    durationMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  }, { status: roundtripReady ? 200 : 500 });
}
