"use client";
type SafeProps=Record<string,string|number|boolean|undefined>;
type ClarityWindow=Window&{clarity?:(...args:(string|number|boolean)[])=>void};
const provider=(process.env.NEXT_PUBLIC_VELVET_ANALYTICS_PROVIDER??"disabled").trim().toLowerCase();
export function trackVelvetEvent(event:string,properties:SafeProps={}){
 const safe=Object.fromEntries(Object.entries(properties).filter(([,v])=>v!==undefined));
 if(provider==="posthog"){const key=process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim(),host=process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()||"https://app.posthog.com";if(!key)return;const payload=JSON.stringify({api_key:key,event,distinct_id:"anonymous",properties:{app:"velvet",privacy:"no_customer_content",...safe}}),endpoint=`${host.replace(/\/$/,"")}/capture/`;if(navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([payload],{type:"application/json"}));return}void fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:payload,keepalive:true}).catch(()=>undefined)}
 if(provider==="clarity"&&"clarity" in window){(window as ClarityWindow).clarity?.("event",event);for(const [key,value] of Object.entries(safe))(window as ClarityWindow).clarity?.("set",key,String(value))}
}
