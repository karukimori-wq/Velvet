import fs from "node:fs";
const config=fs.readFileSync("next.config.js","utf8");
const addAction=fs.readFileSync("app/add/actions.ts","utf8");
const addPage=fs.readFileSync("app/add/page.tsx","utf8");
const addForm=fs.readFileSync("components/add-customer-form.tsx","utf8");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};

assert(config.includes('value: "private, no-store, max-age=0"'),"Sensitive responses must be private and no-store");
for(const route of ["/api/:path*","/people/:path*","/capture/:path*","/schedule/:path*","/search","/remember/:path*","/import","/settings/:path*"])assert(config.includes(`"${route}"`),`Missing no-store coverage for ${route}`);
for(const header of ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy"])assert(config.includes(header),`Missing baseline security header ${header}`);
assert(!addAction.includes("name=${encodeURIComponent(displayName)}"),"Customer names must not be placed in failure query strings");
assert(!addPage.includes("searchParams")&&!addPage.includes("name?:"),"Customer add page must not recover private names from URL parameters");
assert(addForm.includes("useActionState")&&addForm.includes("useState"),"Customer registration errors must preserve private input in page state instead of the URL");

const appFiles=[];
const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())walk(path);else if(/\.(ts|tsx)$/.test(entry.name))appFiles.push(path)}};
walk("app");
for(const path of appFiles){
  const source=fs.readFileSync(path,"utf8");
  assert(!/\.set\(\s*["'](?:draftText|savedValue|note|text|displayName|name|value)["']\s*,/.test(source),`${path}: private user text must not be placed in URLSearchParams`);
  assert(!/[?&](?:draftText|savedValue|note|text|displayName|name|value)=\$\{encodeURIComponent\(/.test(source),`${path}: private user text must not be interpolated into redirect URLs`);
}
if(failures.length){console.error("Privacy cache guard failed:\n- "+failures.join("\n- "));process.exit(1)}
console.log("Privacy cache guard passed: authenticated memory surfaces are no-store and private text is excluded from redirect URLs.");
