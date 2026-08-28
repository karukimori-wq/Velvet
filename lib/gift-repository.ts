import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type GiftDirection = "received" | "given";
export type Gift = { id: string; workspaceId: string; userId: string; customerId: string; direction: GiftDirection; item: string; occasion?: string; note?: string; occurredAt: string };
const gifts: Gift[] = [];
const makeId = () => `gift_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
type GiftRow = { id:string; workspace_id:string; user_id:string; customer_id:string; direction:GiftDirection; item:string; occasion:string|null; memo:string|null; occurred_at:string };
const mapRow=(r:GiftRow):Gift=>({id:r.id,workspaceId:r.workspace_id,userId:r.user_id,customerId:r.customer_id,direction:r.direction,item:r.item,occasion:r.occasion??undefined,note:r.memo??undefined,occurredAt:new Date(r.occurred_at).toISOString()});

export async function listGifts(workspaceId:string,userId:string,customerId?:string):Promise<Gift[]> {
  const mode=getStorageMode();
  if(mode==="d1"){
    const db=await getD1Database(); if(!db) return [];
    const result=customerId
      ? await db.prepare("SELECT id,workspace_id,user_id,customer_id,direction,item,occasion,memo,occurred_at FROM velvet_professional_gifts WHERE workspace_id=? AND user_id=? AND customer_id=? ORDER BY occurred_at DESC").bind(workspaceId,userId,customerId).all<GiftRow>()
      : await db.prepare("SELECT id,workspace_id,user_id,customer_id,direction,item,occasion,memo,occurred_at FROM velvet_professional_gifts WHERE workspace_id=? AND user_id=? ORDER BY occurred_at DESC").bind(workspaceId,userId).all<GiftRow>();
    return result.results.map(mapRow);
  }
  if(mode!=="postgres") return gifts.filter(g=>g.workspaceId===workspaceId&&g.userId===userId&&(!customerId||g.customerId===customerId));
  const rows=await dbQuery<GiftRow>(`select id,workspace_id,user_id,customer_id,direction,item,occasion,memo,occurred_at::text from velvet_professional_gifts where workspace_id=$1 and user_id=$2 and ($3::text is null or customer_id=$3) order by occurred_at desc`,[workspaceId,userId,customerId??null]);
  return rows.rows.map(mapRow);
}

export async function createGift(input:{workspaceId:string;userId:string;customerId:string;direction:GiftDirection;item:string;occasion?:string;note?:string}):Promise<Gift|undefined>{
  const item=input.item.trim(); if(!item) return undefined;
  const mode=getStorageMode();
  const gift:Gift={id:mode==="d1"?makeD1Id("gift"):makeId(),workspaceId:input.workspaceId,userId:input.userId,customerId:input.customerId,direction:input.direction,item,occasion:input.occasion?.trim()||undefined,note:input.note?.trim()||undefined,occurredAt:new Date().toISOString()};
  if(mode==="d1"){
    const db=await getD1Database(); if(!db) throw new Error("D1_NOT_CONFIGURED");
    await db.prepare("INSERT INTO velvet_professional_gifts (id,workspace_id,user_id,customer_id,direction,item,occasion,memo,occurred_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(gift.id,gift.workspaceId,gift.userId,gift.customerId,gift.direction,gift.item,gift.occasion??null,gift.note??null,gift.occurredAt).run();
  } else if(mode!=="postgres") gifts.unshift(gift);
  else await dbQuery(`insert into velvet_professional_gifts (id,workspace_id,user_id,customer_id,direction,item,occasion,memo,occurred_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[gift.id,gift.workspaceId,gift.userId,gift.customerId,gift.direction,gift.item,gift.occasion??null,gift.note??null,gift.occurredAt]);
  await addProfessionalTimelineItem({workspaceId:gift.workspaceId,userId:gift.userId,customerId:gift.customerId,eventType:"gift",title:`${gift.direction==="received"?"もらった":"あげた"} · ${gift.item}`,body:[gift.occasion,gift.note].filter(Boolean).join(" · ")||undefined,sourceRef:gift.id});
  return gift;
}
