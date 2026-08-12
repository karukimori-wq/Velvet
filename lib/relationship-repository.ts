import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type RelationshipType = "friend" | "coworker" | "boss" | "subordinate" | "family" | "partner" | "referral" | "business" | "other";
export type Relationship = { id:string; workspaceId:string; userId:string; customerAId:string; customerBId:string; type:RelationshipType; note?:string; createdAt:string };
const relationships:Relationship[]=[];
const makeId=()=>`rel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
type Row={id:string;workspace_id:string;user_id:string;customer_a_id:string;customer_b_id:string;relation_type:RelationshipType;note:string|null;created_at:string};
const mapRow=(r:Row):Relationship=>({id:r.id,workspaceId:r.workspace_id,userId:r.user_id,customerAId:r.customer_a_id,customerBId:r.customer_b_id,type:r.relation_type,note:r.note??undefined,createdAt:new Date(r.created_at).toISOString()});

export async function listRelationships(workspaceId:string,userId:string){
  if(getStorageMode()!=="postgres") return relationships.filter(r=>r.workspaceId===workspaceId&&r.userId===userId);
  const rows=await dbQuery<Row>(`select id,workspace_id,user_id,customer_a_id,customer_b_id,relation_type,note,created_at::text from velvet_professional_relationships where workspace_id=$1 and user_id=$2 order by created_at desc`,[workspaceId,userId]);
  return rows.rows.map(mapRow);
}
export async function listRelationshipsForCustomer(customerId:string,workspaceId:string,userId:string){ return (await listRelationships(workspaceId,userId)).filter(r=>r.customerAId===customerId||r.customerBId===customerId); }
export async function createRelationship(values:{workspaceId:string;userId:string;customerAId:string;customerBId:string;type:RelationshipType;note?:string}){
  if(values.customerAId===values.customerBId) return undefined;
  const relationship:Relationship={id:makeId(),workspaceId:values.workspaceId,userId:values.userId,customerAId:values.customerAId,customerBId:values.customerBId,type:values.type,note:values.note?.trim()||undefined,createdAt:new Date().toISOString()};
  if(getStorageMode()!=="postgres") relationships.push(relationship); else await dbQuery(`insert into velvet_professional_relationships (id,workspace_id,user_id,customer_a_id,customer_b_id,relation_type,note,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)`,[relationship.id,relationship.workspaceId,relationship.userId,relationship.customerAId,relationship.customerBId,relationship.type,relationship.note??null,relationship.createdAt]);
  const labels:Record<RelationshipType,string>={friend:"友人",coworker:"同僚",boss:"上司",subordinate:"部下",family:"家族",partner:"パートナー",referral:"紹介",business:"取引先",other:"関係"};
  await Promise.all([
    addProfessionalTimelineItem({workspaceId:relationship.workspaceId,userId:relationship.userId,customerId:relationship.customerAId,eventType:"relationship",title:`${labels[relationship.type]} · ${relationship.customerBId}`,body:relationship.note,sourceRef:relationship.id}),
    addProfessionalTimelineItem({workspaceId:relationship.workspaceId,userId:relationship.userId,customerId:relationship.customerBId,eventType:"relationship",title:`${labels[relationship.type]} · ${relationship.customerAId}`,body:relationship.note,sourceRef:relationship.id}),
  ]);
  return relationship;
}
