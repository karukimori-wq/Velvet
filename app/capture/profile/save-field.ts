"use server";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";

export async function saveField(customerId:string, kind:CaptureKind, formData:FormData){
  const value=String(formData.get("value")??"").trim();
  if(!value) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}`);
  const {workspaceId,userId}=await getRequestIdentity();
  await createCapture({workspaceId,userId,customerId,kind,value});
  redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&saved=${encodeURIComponent(value)}`);
}
