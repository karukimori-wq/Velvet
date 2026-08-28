import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type ScheduleKind = "shift" | "visit" | "birthday" | "unavailable" | "self_investment" | "other";
export type ScheduleEntry = { id:string; workspaceId:string; userId:string; customerId?:string; visitScheduleId?:string; kind:ScheduleKind; title:string; startsAt:string; note?:string; createdAt:string };
const entries:ScheduleEntry[]=[];
const makeId=()=>`schedule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
type ScheduleRow={id:string;workspace_id:string;user_id:string;customer_id:string|null;visit_schedule_id:string|null;entry_type:ScheduleKind;title:string;starts_at:string;note:string|null;created_at:string};
const mapRow=(r:ScheduleRow):ScheduleEntry=>({id:r.id,workspaceId:r.workspace_id,userId:r.user_id,customerId:r.customer_id??undefined,visitScheduleId:r.visit_schedule_id??undefined,kind:r.entry_type,title:r.title,startsAt:new Date(r.starts_at).toISOString(),note:r.note??undefined,createdAt:new Date(r.created_at).toISOString()});

export async function listScheduleEntries(workspaceId:string,userId:string){
  const mode=getStorageMode();
  if(mode==="d1"){
    const db=await getD1Database(); if(!db) return [];
    const result=await db.prepare("SELECT id,workspace_id,user_id,customer_id,visit_schedule_id,entry_type,title,starts_at,note,created_at FROM velvet_professional_schedule_entries WHERE workspace_id=? AND user_id=? ORDER BY starts_at").bind(workspaceId,userId).all<ScheduleRow>();
    return result.results.map(mapRow);
  }
  if(mode!=="postgres") return entries.filter(e=>e.workspaceId===workspaceId&&e.userId===userId).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
  const rows=await dbQuery<ScheduleRow>(`select id,workspace_id,user_id,customer_id,visit_schedule_id,entry_type,title,starts_at::text,note,created_at::text from velvet_professional_schedule_entries where workspace_id=$1 and user_id=$2 order by starts_at`,[workspaceId,userId]);
  return rows.rows.map(mapRow);
}

export async function createScheduleEntry(values:{workspaceId:string;userId:string;customerId?:string;visitScheduleId?:string;kind:ScheduleKind;title:string;startsAt?:string;note?:string}){
  const title=values.title.trim(); if(!title) return undefined;
  const mode=getStorageMode();
  const entry:ScheduleEntry={id:mode==="d1"?makeD1Id("schedule"):makeId(),workspaceId:values.workspaceId,userId:values.userId,customerId:values.customerId,visitScheduleId:values.visitScheduleId,kind:values.kind,title,startsAt:values.startsAt??new Date().toISOString(),note:values.note?.trim()||undefined,createdAt:new Date().toISOString()};
  if(mode==="d1"){
    const db=await getD1Database(); if(!db) throw new Error("D1_NOT_CONFIGURED");
    await db.prepare("INSERT INTO velvet_professional_schedule_entries (id,workspace_id,user_id,customer_id,visit_schedule_id,entry_type,title,starts_at,note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(entry.id,entry.workspaceId,entry.userId,entry.customerId??null,entry.visitScheduleId??null,entry.kind,entry.title,entry.startsAt,entry.note??null,entry.createdAt).run();
  } else if(mode!=="postgres") entries.push(entry);
  else await dbQuery(`insert into velvet_professional_schedule_entries (id,workspace_id,user_id,customer_id,visit_schedule_id,entry_type,title,starts_at,note,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[entry.id,entry.workspaceId,entry.userId,entry.customerId??null,entry.visitScheduleId??null,entry.kind,entry.title,entry.startsAt,entry.note??null,entry.createdAt]);
  if(entry.customerId) await addProfessionalTimelineItem({workspaceId:entry.workspaceId,userId:entry.userId,customerId:entry.customerId,eventType:"schedule",title:`予定 · ${entry.title}`,body:entry.note,sourceRef:entry.visitScheduleId??entry.id});
  return entry;
}
