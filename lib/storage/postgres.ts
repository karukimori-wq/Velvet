import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { assertProductionStorageReady, getDatabaseUrl, getStorageMode } from "./config";

let pool: Pool | undefined;

function getPool() {
  assertProductionStorageReady();
  if (getStorageMode() !== "postgres") throw new Error("POSTGRES_NOT_ENABLED: VELVET_STORAGE_MODE must be postgres.");
  const connectionString = getDatabaseUrl();
  if (!connectionString) throw new Error("DATABASE_URL_MISSING");
  pool ??= new Pool({connectionString,max:Number(process.env.VELVET_DB_POOL_MAX ?? 5),ssl:process.env.VELVET_DB_SSL === "disable" ? false : { rejectUnauthorized: false }});
  return pool;
}

export async function dbQuery<T extends QueryResultRow>(text:string,values:readonly unknown[]=[]){return getPool().query<T>(text,[...values])}
export async function withTransaction<T>(work:(client:PoolClient)=>Promise<T>):Promise<T>{const client=await getPool().connect();try{await client.query("begin");const result=await work(client);await client.query("commit");return result}catch(error){await client.query("rollback");throw error}finally{client.release()}}
export async function checkPostgresConnection(){const startedAt=Date.now();try{const result=await dbQuery<{now:string}>("select now()::text as now");return{status:"success" as const,connected:true,databaseTime:result.rows[0]?.now,durationMs:Date.now()-startedAt}}catch(error){return{status:"error" as const,connected:false,errorCode:"DATABASE_CONNECTION_FAILED",message:error instanceof Error?error.message:"Database connection failed.",durationMs:Date.now()-startedAt}}}
