"use server";
import { revalidatePath } from "next/cache";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createNextAction, listNextActions } from "@/lib/professional-next-action-repository";
export async function createSuggestedNextAction(customerId:string,sourceTopicId:string,topicId:string,actionType:string,text:string){
 const {workspaceId,userId}=await getRequestIdentity();
 if(!customerId||!sourceTopicId||!text.trim())return;
 const existing=await listNextActions(workspaceId,userId,customerId);
 if(existing.some(item=>item.status==="open"&&item.sourceTopicId===sourceTopicId&&item.topicId===topicId&&item.text.trim()===text.trim()))return;
 await createNextAction(workspaceId,userId,customerId,text,undefined,{sourceTopicId,topicId,actionType,timing:"next_visit"});
 revalidatePath("/capture");
 revalidatePath(`/people/${customerId}/next-actions`);
}
