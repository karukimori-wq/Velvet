import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";

export type ConversationEpisodeState = "new" | "continued" | "changed" | "done";
export type ConversationEpisode = { id:string; workspaceId:string; userId:string; customerId:string; visitId?:string; captureId:string; topicId:string; label:string; content:string; state:ConversationEpisodeState; occurredAt:string; createdAt:string };
type Row={id:string;workspace_id:string;user_id:string;customer_id:string;visit_id:string|null;capture_id:string;topic_id:string;label:string;content:string;state:ConversationEpisodeState;occurred_at:string;created_at:string};
const memoryRows:ConversationEpisode[]=[];
const map=(r:Row):ConversationEpisode=>({id:r.id,workspaceId:r.workspace_id,userId:r.user_id,customerId:r.customer_id,visitId:r.visit_id??undefined,captureId:r.capture_id,topicId:r.topic_id,label:r.label,content:r.content,state:r.state,occurredAt:new Date(r.occurred_at).toISOString(),createdAt:new Date(r.created_at).toISOString()});
const makeId=()=>`episode_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;

export async function createConversationEpisode(input:{workspaceId:string;userId:string;customerId:string;visitId?:string;captureId:string;topicId:string;label:string;content:string;state?:ConversationEpisodeState;occurredAt?:string}){
 const now=new Date().toISOString(),item:ConversationEpisode={id:getStorageMode()==="d1"?makeD1Id("episode"):makeId(),workspaceId:input.workspaceId,userId:input.userId,customerId:input.customerId,visitId:input.visitId,captureId:input.captureId,topicId:input.topicId,label:input.label,content:input.content.trim(),state:input.state??"new",occurredAt:input.occurredAt??now,createdAt:now};
 if(!item.content)return undefined;
 if(getStorageMode()==="d1"){const db=await getD1Database();if(!db)throw new Error("D1_NOT_CONFIGURED");await db.prepare("INSERT OR IGNORE INTO velvet_conversation_episodes(id,workspace_id,user_id,customer_id,visit_id,capture_id,topic_id,label,content,state,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(item.id,item.workspaceId,item.userId,item.customerId,item.visitId??null,item.captureId,item.topicId,item.label,item.content,item.state,item.occurredAt,item.createdAt).run()}
 else if(getStorageMode()!=="postgres"){if(!memoryRows.some(r=>r.captureId===item.captureId&&r.topicId===item.topicId&&r.label===item.label&&r.content===item.content))memoryRows.unshift(item)}
 else await dbQuery(`insert into velvet_conversation_episodes(id,workspace_id,user_id,customer_id,visit_id,capture_id,topic_id,label,content,state,occurred_at,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict do nothing`,[item.id,item.workspaceId,item.userId,item.customerId,item.visitId??null,item.captureId,item.topicId,item.label,item.content,item.state,item.occurredAt,item.createdAt]);
 return item;
}

export async function listConversationEpisodes(workspaceId:string,userId:string,customerId:string,limit=100){
 if(getStorageMode()==="d1"){const db=await getD1Database();if(!db)return[];const r=await db.prepare("select id,workspace_id,user_id,customer_id,visit_id,capture_id,topic_id,label,content,state,occurred_at,created_at from velvet_conversation_episodes where workspace_id=? and user_id=? and customer_id=? order by occurred_at desc limit ?").bind(workspaceId,userId,customerId,limit).all<Row>();return r.results.map(map)}
 if(getStorageMode()!=="postgres")return memoryRows.filter(r=>r.workspaceId===workspaceId&&r.userId===userId&&r.customerId===customerId).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)).slice(0,limit);
 const r=await dbQuery<Row>(`select id,workspace_id,user_id,customer_id,visit_id,capture_id,topic_id,label,content,state,occurred_at::text,created_at::text from velvet_conversation_episodes where workspace_id=$1 and user_id=$2 and customer_id=$3 order by occurred_at desc limit $4`,[workspaceId,userId,customerId,limit]);return r.rows.map(map)
}
