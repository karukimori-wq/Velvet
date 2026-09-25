export type RecallPhase="early"|"developing"|"established"|"returning_after_gap";
const DAY=86400000;
export function getRecallPhase(visits:Array<{visitedAt:string}>,now=Date.now()):{phase:RecallPhase;visitCount:number;daysSinceLastVisit?:number}{
 const sorted=[...visits].sort((a,b)=>b.visitedAt.localeCompare(a.visitedAt)),visitCount=sorted.length;
 const last=sorted[0]?new Date(sorted[0].visitedAt).getTime():undefined;
 const daysSinceLastVisit=last&&Number.isFinite(last)?Math.max(0,Math.floor((now-last)/DAY)):undefined;
 if(daysSinceLastVisit!==undefined&&daysSinceLastVisit>=180)return{phase:"returning_after_gap",visitCount,daysSinceLastVisit};
 if(visitCount<=2)return{phase:"early",visitCount,daysSinceLastVisit};
 if(visitCount<=5)return{phase:"developing",visitCount,daysSinceLastVisit};
 return{phase:"established",visitCount,daysSinceLastVisit};
}
export function recallPresentation(phase:RecallPhase){
 if(phase==="early")return{profileOpen:true,ongoingLimit:2,title:"この人について"};
 if(phase==="developing")return{profileOpen:false,ongoingLimit:3,title:"前回から続いている話"};
 if(phase==="returning_after_gap")return{profileOpen:true,ongoingLimit:3,title:"久しぶりなので思い出す"};
 return{profileOpen:false,ongoingLimit:3,title:"続いている話"};
}
