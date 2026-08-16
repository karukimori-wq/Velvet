export type MemoryTagMode="replace"|"accumulate";
export type MemoryTagChange={label:string;value:string;kind:"new"|"changed"|"added";previousValues:string[]};

// Current-state fields replace the previous value. Identity/context fields can accumulate
// because learning another hobby, family detail, or preference should not erase prior knowledge.
const accumulateLabels=new Set([
 "家族","大切にしていること","趣味","スポーツ","音楽","映画・ドラマ","車","旅行",
 "好きな食べ物","苦手な食べ物","好きな店・場所","好きなブランド","その他の好み",
 "よく話す話題","避けたい話題","気にしていること","約束・覚えておくこと"
]);
export function memoryTagMode(label:string):MemoryTagMode{return accumulateLabels.has(label)?"accumulate":"replace"}
function labelOf(tag:string){const i=tag.indexOf("：");return i>0?tag.slice(0,i):""}function valueOf(tag:string){const i=tag.indexOf("：");return i>0?tag.slice(i+1):tag}
export function mergeMemoryTags(existing:string[],incoming:string[]){let result=[...existing];for(const tag of incoming){const label=labelOf(tag);if(!label)continue;if(memoryTagMode(label)==="replace")result=result.filter(current=>labelOf(current)!==label);if(!result.includes(tag))result.push(tag)}return result}
export function describeMemoryTagChanges(existing:string[],incoming:string[]):MemoryTagChange[]{const changes:MemoryTagChange[]=[];for(const tag of incoming){const label=labelOf(tag),value=valueOf(tag);if(!label||!value)continue;const previous=existing.filter(item=>labelOf(item)===label).map(valueOf);if(previous.includes(value))continue;const mode=memoryTagMode(label);changes.push({label,value,kind:previous.length===0?"new":mode==="replace"?"changed":"added",previousValues:previous})}return changes}
