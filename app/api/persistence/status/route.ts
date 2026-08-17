import { NextResponse } from "next/server";
import { getStorageReadiness } from "@/lib/storage/config";

export async function GET(){
  const storage=getStorageReadiness();
  return NextResponse.json({
    appName:"velvet",
    status:storage.status,
    storageMode:storage.mode,
    persistent:storage.persistent,
    errorCode:storage.errorCode,
    message:storage.persistent?"Velvet data is using persistent storage.":"Velvet data is using temporary in-memory storage. Configure DATABASE_URL for reliable production capture and memory flows."
  });
}
