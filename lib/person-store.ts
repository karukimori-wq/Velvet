import { getPerson as getMemoryPerson, listPeople as listMemoryPeople, type Person, type TimelineItem } from "./demo-data";
import { getPlanAccess, isWithinHistoryWindow, type PlanAccess } from "./plan-access";
import { getStorageMode } from "./storage/config";
import { dbQuery } from "./storage/postgres";

type ReadOptions = { includeArchived?: boolean };
type PersonRow = { id:string; owner_user_id:string; name:string; rank:string|null; last_visit:string|null; next_visit:string|null };
type KnowledgeRow = { person_id:string; value:string };
type TimelineRow = { person_id:string; id:string; occurred_at:string; title:string; body:string|null; event_type:string; source_ref:string|null };
const toDateLabel=(value:string|null|undefined)=>value?new Date(value).toISOString().slice(0,10):undefined;

function applyMemoryAccess(person: Person, access: PlanAccess, options: ReadOptions): Person {
  if (options.includeArchived) return { ...person, personality:[...person.personality], timeline:[...person.timeline] };
  return { ...person, lastVisit:person.lastVisit&&isWithinHistoryWindow(person.lastVisit,access)?person.lastVisit:undefined, personality:[...person.personality], timeline:person.timeline.filter((item)=>isWithinHistoryWindow(item.date,access)).map((item)=>({...item})) };
}
function mapRows(rows:PersonRow[],knowledgeRows:KnowledgeRow[],timelineRows:TimelineRow[],access:PlanAccess,options:ReadOptions):Person[]{
  const knowledge=new Map<string,string[]>(); for(const row of knowledgeRows){const list=knowledge.get(row.person_id)??[];list.push(row.value);knowledge.set(row.person_id,list);} const timeline=new Map<string,TimelineItem[]>(); for(const row of timelineRows){const list=timeline.get(row.person_id)??[];list.push({id:row.id,date:toDateLabel(row.occurred_at)??"",title:row.title,body:row.body??undefined,eventType:row.event_type,sourceRef:row.source_ref??undefined});timeline.set(row.person_id,list);} return rows.map((row)=>({id:row.id,ownerUserId:row.owner_user_id,name:row.name,rank:row.rank??undefined,lastVisit:options.includeArchived||isWithinHistoryWindow(row.last_visit??undefined,access)?toDateLabel(row.last_visit):undefined,nextVisit:row.next_visit?new Date(row.next_visit).toISOString():undefined,personality:knowledge.get(row.id)??[],timeline:timeline.get(row.id)??[]}));
}

/** Legacy migration/rollback reader only. New product code must not depend on this store. */
export async function listPeopleStore(ownerUserId:string,options:ReadOptions={}):Promise<Person[]>{
  const access=await getPlanAccess(ownerUserId); if(getStorageMode()!=="postgres") return listMemoryPeople(ownerUserId).map((person)=>applyMemoryAccess(person,access,options)); const cutoff=options.includeArchived||access.fullHistory?null:access.historyCutoff?.toISOString()??null; const [people,knowledge,timeline]=await Promise.all([
    dbQuery<PersonRow>(`select id,owner_user_id,name,rank,last_visit::text,next_visit::text from velvet_people where owner_user_id=$1 order by updated_at desc,name`,[ownerUserId]),
    dbQuery<KnowledgeRow>(`select person_id,value from velvet_knowledge where owner_user_id=$1 order by created_at`,[ownerUserId]),
    dbQuery<TimelineRow>(`select person_id,id,occurred_at::text,title,body,event_type,source_ref from velvet_timeline_items where owner_user_id=$1 and ($2::timestamptz is null or occurred_at >= $2) order by occurred_at desc`,[ownerUserId,cutoff])]); return mapRows(people.rows,knowledge.rows,timeline.rows,access,options);
}
/** Legacy migration/rollback reader only. */
export async function getPersonStore(personId:string,ownerUserId:string,options:ReadOptions={}):Promise<Person|undefined>{
  const access=await getPlanAccess(ownerUserId); if(getStorageMode()!=="postgres"){const person=getMemoryPerson(personId,ownerUserId);return person?applyMemoryAccess(person,access,options):undefined;} const cutoff=options.includeArchived||access.fullHistory?null:access.historyCutoff?.toISOString()??null; const people=await dbQuery<PersonRow>(`select id,owner_user_id,name,rank,last_visit::text,next_visit::text from velvet_people where id=$1 and owner_user_id=$2 limit 1`,[personId,ownerUserId]); if(!people.rows[0])return undefined; const [knowledge,timeline]=await Promise.all([dbQuery<KnowledgeRow>(`select person_id,value from velvet_knowledge where person_id=$1 and owner_user_id=$2 order by created_at`,[personId,ownerUserId]),dbQuery<TimelineRow>(`select person_id,id,occurred_at::text,title,body,event_type,source_ref from velvet_timeline_items where person_id=$1 and owner_user_id=$2 and ($3::timestamptz is null or occurred_at >= $3) order by occurred_at desc`,[personId,ownerUserId,cutoff])]); return mapRows(people.rows,knowledge.rows,timeline.rows,access,options)[0];
}

function legacyWriteForbidden(): never { throw new Error("LEGACY_PERSON_STORE_READ_ONLY"); }
export async function createPersonStore(_name:string,_ownerUserId:string):Promise<Person>{ return legacyWriteForbidden(); }
export async function updatePersonBasicsStore(_personId:string,_values:{name?:string;rank?:string},_ownerUserId:string):Promise<Person|undefined>{ return legacyWriteForbidden(); }
export async function addPersonKnowledgeStore(_personId:string,_rawValue:string,_ownerUserId:string):Promise<Person|undefined>{ return legacyWriteForbidden(); }
export async function removePersonKnowledgeStore(_personId:string,_value:string,_ownerUserId:string):Promise<Person|undefined>{ return legacyWriteForbidden(); }
export async function addTimelineItemStore(_personId:string,_item:{id?:string;date?:string;title:string;body?:string;eventType?:string;sourceRef?:string},_ownerUserId:string):Promise<Person|undefined>{ return legacyWriteForbidden(); }
