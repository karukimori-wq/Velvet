export type GrowthCustomerDisplay = {
  customerId: string;
  displayName?: string;
  contacts?: Array<{ type: string; value: string; label?: string }>;
};

export type GrowthEngineContext = { workspaceId:string; userId:string; customerId:string; reservationId?:string; visitScheduleId?:string; intent?:string };

export function getGrowthEngineBaseUrl(){ return process.env.GROWTH_ENGINE_BASE_URL?.trim() || undefined; }
function integrationSecret(){ return process.env.GROWTH_ENGINE_INTEGRATION_SECRET?.trim() || undefined; }

function mapCustomer(raw:Record<string,unknown>):GrowthCustomerDisplay|undefined {
  const customerId=typeof raw.customerId==="string"?raw.customerId:typeof raw.id==="string"?raw.id:undefined;
  if(!customerId)return undefined;
  return {
    customerId,
    displayName:typeof raw.name==="string"?raw.name:typeof raw.displayName==="string"?raw.displayName:undefined,
    contacts:Array.isArray(raw.contacts)?raw.contacts.flatMap(item=>{
      if(!item||typeof item!=="object")return[];
      const row=item as Record<string,unknown>;
      if(typeof row.type!=="string"||typeof row.value!=="string")return[];
      return[{type:row.type,value:row.value,label:typeof row.label==="string"?row.label:undefined}];
    }):undefined
  };
}

function trustedHeaders(userId:string){
  const secret=integrationSecret();
  return {
    "X-Source-App":"velvet",
    "X-User-Id":userId,
    ...(secret?{"X-Velvet-Integration-Secret":secret}:{})
  };
}

function trustedCustomerUrl(baseUrl:string,workspaceId:string,customerId?:string){
  const url=new URL("/api/integrations/velvet/customers",baseUrl);
  url.searchParams.set("workspaceId",workspaceId);
  if(customerId)url.searchParams.set("customerId",customerId);
  return url;
}

export async function getGrowthCustomerDisplay(context:GrowthEngineContext):Promise<GrowthCustomerDisplay>{
  const baseUrl=getGrowthEngineBaseUrl();
  if(!baseUrl)return{customerId:context.customerId};
  const secret=integrationSecret();
  const url=secret?trustedCustomerUrl(baseUrl,context.workspaceId,context.customerId):new URL(`/api/customers/${encodeURIComponent(context.customerId)}?workspaceId=${encodeURIComponent(context.workspaceId)}`,baseUrl);
  const response=await fetch(url,{headers:trustedHeaders(context.userId),cache:"no-store"});
  if(!response.ok)return{customerId:context.customerId};
  const raw=await response.json() as Record<string,unknown>;
  const customer=raw.customer&&typeof raw.customer==="object"?raw.customer as Record<string,unknown>:raw;
  return mapCustomer(customer)??{customerId:context.customerId};
}

export async function getGrowthCustomer(workspaceId:string,userId:string,customerId:string){return getGrowthCustomerDisplay({workspaceId,userId,customerId});}

export async function listGrowthCustomers(workspaceId:string,userId:string):Promise<GrowthCustomerDisplay[]>{
  const baseUrl=getGrowthEngineBaseUrl();
  if(!baseUrl)return[];
  const secret=integrationSecret();
  const url=secret?trustedCustomerUrl(baseUrl,workspaceId):new URL(`/api/customers?workspaceId=${encodeURIComponent(workspaceId)}`,baseUrl);
  const response=await fetch(url,{headers:trustedHeaders(userId),cache:"no-store"});
  if(!response.ok)return[];
  const raw=await response.json() as unknown;
  const items=Array.isArray(raw)?raw:raw&&typeof raw==="object"&&Array.isArray((raw as Record<string,unknown>).customers)?(raw as Record<string,unknown>).customers as unknown[]:[];
  return items.flatMap(item=>item&&typeof item==="object"?(mapCustomer(item as Record<string,unknown>)?[mapCustomer(item as Record<string,unknown>)!]:[]):[]);
}

export async function createGrowthCustomer(workspaceId:string,userId:string,displayName:string):Promise<GrowthCustomerDisplay|undefined>{
  const baseUrl=getGrowthEngineBaseUrl();
  if(!baseUrl)return undefined;
  const secret=integrationSecret();
  const url=secret?new URL("/api/integrations/velvet/customers",baseUrl):new URL("/api/customers",baseUrl);
  const response=await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json",...trustedHeaders(userId)},
    body:JSON.stringify({workspaceId,userId,displayName}),
    cache:"no-store"
  });
  if(!response.ok)return undefined;
  const raw=await response.json() as Record<string,unknown>;
  const customer=raw.customer&&typeof raw.customer==="object"?raw.customer as Record<string,unknown>:raw;
  return mapCustomer(customer);
}
