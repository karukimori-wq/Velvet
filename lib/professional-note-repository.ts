import { getStorageMode } from "@/lib/storage/config";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type ProfessionalNote={id:string;workspaceId:string;userId:string;customerId:string;visitId?:string;title:string;body:string;createdAt:string};
const rows:ProfessionalNote[]=[];
const makeId=()=>`note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;

export async function createProfessionalNote(input:{workspaceId:string;userId:string;customerId:string;visitId?:string;title?:string;body:string}){
 const body=input.body.trim();if(!body)throw new Error("NOTE_REQUIRED");const mode=getStorageMode(),createdAt=new Date().toISOString(),item:ProfessionalNote={id:mode==="d1"?makeD1Id("note"):makeId(),workspaceId:input.workspaceId,userId:input.userId,customerId:input.customerId,visitId:input.visitId,title:input.title?.trim()||"接客メモ",body,createdAt};
 if(mode==="d1"){const db=await getD1Database();if(!db)throw new Error("D1_NOT_CONFIGURED");await db.prepare("INSERT INTO velvet_notes (id,workspace_id,user_id,customer_id,visit_id,note_type,note_ref,body_preview,created_at) VALUES (?,?,?,?,?,'professional_note',?,?,?)").bind(item.id,item.workspaceId,item.userId,item.customerId,item.visitId??null,`velvet:note:${item.id}`,item.body.slice(0,500),item.createdAt).run()}else if(mode==="memory")rows.unshift(item);
 await addProfessionalTimelineItem({workspaceId:item.workspaceId,userId:item.userId,customerId:item.customerId,eventType:"note",title:item.title,body:item.body,sourceRef:item.id,occurredAt:item.createdAt});return item;
}
