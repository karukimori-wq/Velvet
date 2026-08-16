import type { VelvetCustomerMemory } from "@/lib/customer-memory-repository";
import { visibleNextTopics } from "@/lib/next-topic";

export type RecallItem={label:string;value:string;priority:number};

const quickTagLabels=["注意点","会話の好み","接客の距離感","よく飲むもの","お酒の強さ","仕事","家族","趣味","最近の出来事","約束・覚えておくこと"];
function labelOf(tag:string){const i=tag.indexOf("：");return i>0?tag.slice(0,i):""}

export function buildCustomerRecall(memory:VelvetCustomerMemory|undefined,options?:{maxItems?:number;maxNextTopics?:number}){
 const maxItems=options?.maxItems??5;const maxNextTopics=options?.maxNextTopics??3;const items:RecallItem[]=[];
 if(memory?.cautionNote)items.push({label:"注意",value:memory.cautionNote,priority:100});
 if(memory?.lastInteractionSummary)items.push({label:"前回",value:memory.lastInteractionSummary,priority:90});
 if(memory?.preferenceNote)items.push({label:"好み",value:memory.preferenceNote,priority:80});
 for(const tag of memory?.tags??[]){const label=labelOf(tag);if(!quickTagLabels.includes(label))continue;items.push({label,value:tag.slice(label.length+1),priority:label==="注意点"?95:label==="約束・覚えておくこと"?88:label==="最近の出来事"?84:60});}
 const deduped=Array.from(new Map(items.sort((a,b)=>b.priority-a.priority).map(item=>[`${item.label}:${item.value}`,item])).values()).slice(0,maxItems);
 return{items:deduped,nextTopics:visibleNextTopics(memory?.nextTopicHint,maxNextTopics)};
}
