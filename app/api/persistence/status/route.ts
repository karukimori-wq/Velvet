import {NextResponse} from "next/server";
import {getStorageReadiness} from "@/lib/storage/config";
import {checkPostgresConnection,dbQuery} from "@/lib/storage/postgres";

export async function GET(){
  const storage=getStorageReadiness();
  if(!storage.persistent)return NextResponse.json({appName:"velvet",status:"warning",storageMode:storage.mode,persistent:false,databaseConfigured:storage.databaseUrlConfigured,postgresReachable:false,migrationsReady:false,nextActionMigrationApplied:false,errorCode:storage.errorCode,message:"Velvet data is using temporary in-memory storage. Configure DATABASE_URL or POSTGRES_URL for reliable production flows."});
  const connection=await checkPostgresConnection();
  if(!connection.connected)return NextResponse.json({appName:"velvet",status:"error",storageMode:storage.mode,persistent:true,databaseConfigured:true,postgresReachable:false,migrationsReady:false,nextActionMigrationApplied:false,errorCode:connection.errorCode,message:connection.message},{status:503});
  let applied:string[]=[];
  try{const result=await dbQuery<{filename:string}>("select filename from velvet_schema_migrations order by filename");applied=result.rows.map(row=>row.filename)}catch{}
  const required=["009_customer_scoped_professional_records.sql","009_professional_timeline.sql","010_capture_dictionary.sql","011_professional_next_actions.sql"];
  const missing=required.filter(file=>!applied.includes(file));
  return NextResponse.json({appName:"velvet",status:missing.length?"warning":"success",storageMode:storage.mode,persistent:true,databaseConfigured:true,postgresReachable:true,migrationsReady:missing.length===0,nextActionMigrationApplied:applied.includes("011_professional_next_actions.sql"),missingMigrations:missing,databaseTime:connection.databaseTime,durationMs:connection.durationMs,errorCode:missing.length?"MIGRATIONS_INCOMPLETE":null});
}
