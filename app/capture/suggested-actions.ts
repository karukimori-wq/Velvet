"use server";
import { revalidatePath } from "next/cache";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createNextAction } from "@/lib/professional-next-action-repository";
export async function createSuggestedNextAction(customerId:string,sourceTopicId:string,topicId:string,actionType:string,text:string){
 const {workspaceId,userId}=await getRequestIdentity();
 if(!customerId||!sourceTopicId||!text.trim())return;
 await createNextAction(workspaceId,userId,customerId,text,undefined,{sourceTopicId,topicId,actionType,timing:"next_visit"});
 revalidatePath("/capture");
 revalidatePath(`/people/${customerId}/next-actions`);
}
