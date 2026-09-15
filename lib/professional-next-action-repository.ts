import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type ProfessionalNextAction = {
  id: string;
  workspaceId: string;
  userId: string;
  customerId: string;
  text: string;
  status: "open" | "done";
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
};

const rows: ProfessionalNextAction[] = [];
const makeId = () => `next_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
type Row = { id:string; workspace_id:string; user_id:string; customer_id:string; text:string; status:"open"|"done"; created_at:string; due_at?:string|null; completed_at:string|null };
const map = (r: Row): ProfessionalNextAction => ({ id:r.id, workspaceId:r.workspace_id, userId:r.user_id, customerId:r.customer_id, text:r.text, status:r.status, createdAt:new Date(r.created_at).toISOString(), dueAt:r.due_at?new Date(r.due_at).toISOString():undefined, completedAt:r.completed_at?new Date(r.completed_at).toISOString():undefined });

function normalizeDueAt(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString() : undefined; }
function order(a: ProfessionalNextAction, b: ProfessionalNextAction) { return Number(a.status === "done") - Number(b.status === "done") || (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999") || b.createdAt.localeCompare(a.createdAt); }

export async function listNextActions(workspaceId: string, userId: string, customerId: string) {
  if (getStorageMode() === "d1") {
    const db = await getD1Database(); if (!db) return [];
    const r = await db.prepare("select id,workspace_id,user_id,customer_id,text,status,created_at,due_at,completed_at from velvet_professional_next_actions where workspace_id=? and user_id=? and customer_id=? order by case when status='open' then 0 else 1 end,case when due_at is null then 1 else 0 end,due_at asc,created_at desc").bind(workspaceId,userId,customerId).all<Row>();
    return r.results.map(map);
  }
  if (getStorageMode() !== "postgres") return rows.filter(r => r.workspaceId === workspaceId && r.userId === userId && r.customerId === customerId).sort(order);
  const result = await dbQuery<Row>(`select id,workspace_id,user_id,customer_id,text,status,created_at::text,due_at::text,completed_at::text from velvet_professional_next_actions where workspace_id=$1 and user_id=$2 and customer_id=$3 order by case when status='open' then 0 else 1 end,case when due_at is null then 1 else 0 end,due_at asc,created_at desc`, [workspaceId,userId,customerId]);
  return result.rows.map(map);
}

export async function listDueNextActions(workspaceId: string, userId: string, through: Date, limit = 8) {
  const throughIso = through.toISOString();
  if (getStorageMode() === "d1") {
    const db = await getD1Database(); if (!db) return [];
    const r = await db.prepare("select id,workspace_id,user_id,customer_id,text,status,created_at,due_at,completed_at from velvet_professional_next_actions where workspace_id=? and user_id=? and status='open' and due_at is not null and due_at<=? order by due_at asc,created_at desc limit ?").bind(workspaceId,userId,throughIso,limit).all<Row>();
    return r.results.map(map);
  }
  if (getStorageMode() !== "postgres") return rows.filter(r => r.workspaceId === workspaceId && r.userId === userId && r.status === "open" && r.dueAt && r.dueAt <= throughIso).sort(order).slice(0,limit);
  const result = await dbQuery<Row>(`select id,workspace_id,user_id,customer_id,text,status,created_at::text,due_at::text,completed_at::text from velvet_professional_next_actions where workspace_id=$1 and user_id=$2 and status='open' and due_at is not null and due_at<=$3 order by due_at asc,created_at desc limit $4`, [workspaceId,userId,throughIso,limit]);
  return result.rows.map(map);
}

export async function createNextAction(workspaceId:string,userId:string,customerId:string,text:string,dueAt?:string){const normalizedDueAt=normalizeDueAt(dueAt);const item:ProfessionalNextAction={id:getStorageMode()==="d1"?makeD1Id("next"):makeId(),workspaceId,userId,customerId,text:text.trim(),status:"open",createdAt:new Date().toISOString(),dueAt:normalizedDueAt};if(getStorageMode()==="d1"){const db=await getD1Database();if(!db)throw new Error("D1_NOT_CONFIGURED");await db.prepare("insert into velvet_professional_next_actions(id,workspace_id,user_id,customer_id,text,status,created_at,due_at) values(?,?,?,?,?,'open',?,?)").bind(item.id,workspaceId,userId,customerId,item.text,item.createdAt,item.dueAt??null).run()}else if(getStorageMode()!=="postgres")rows.unshift(item);else await dbQuery(`insert into velvet_professional_next_actions(id,workspace_id,user_id,customer_id,text,status,created_at,due_at) values($1,$2,$3,$4,$5,'open',$6,$7)`,[item.id,workspaceId,userId,customerId,item.text,item.createdAt,item.dueAt??null]);await addProfessionalTimelineItem({workspaceId,userId,customerId,eventType:"next_action",title:"次回アクション",body:[item.text,item.dueAt?`期限 ${item.dueAt.slice(0,10)}`:undefined].filter(Boolean).join(" · "),sourceRef:item.id});return item}
export async function completeNextAction(workspaceId:string,userId:string,customerId:string,id:string){const completedAt=new Date().toISOString();if(getStorageMode()==="d1"){const db=await getD1Database();if(!db)return false;const existing=await db.prepare("select id from velvet_professional_next_actions where id=? and workspace_id=? and user_id=? and customer_id=?").bind(id,workspaceId,userId,customerId).first();if(!existing)return false;await db.prepare("update velvet_professional_next_actions set status='done',completed_at=? where id=? and workspace_id=? and user_id=? and customer_id=?").bind(completedAt,id,workspaceId,userId,customerId).run()}else if(getStorageMode()!=="postgres"){const item=rows.find(r=>r.id===id&&r.workspaceId===workspaceId&&r.userId===userId&&r.customerId===customerId);if(!item)return false;item.status="done";item.completedAt=completedAt}else{const result=await dbQuery(`update velvet_professional_next_actions set status='done',completed_at=$5 where id=$1 and workspace_id=$2 and user_id=$3 and customer_id=$4`,[id,workspaceId,userId,customerId,completedAt]);if(!result.rowCount)return false}await addProfessionalTimelineItem({workspaceId,userId,customerId,eventType:"next_action",title:"次回アクション完了",sourceRef:id});return true}
