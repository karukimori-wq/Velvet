import fs from "node:fs";
const config=fs.readFileSync("next.config.js","utf8");const failures=[];const assert=(condition,message)=>{if(!condition)failures.push(message)};
assert(config.includes('value: "private, no-store, max-age=0"'),"Sensitive responses must be private and no-store");
for(const route of ["/api/:path*","/people/:path*","/capture/:path*","/schedule/:path*","/search","/remember/:path*","/import","/settings/:path*"])assert(config.includes(`"${route}"`),`Missing no-store coverage for ${route}`);
for(const header of ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy"])assert(config.includes(header),`Missing baseline security header ${header}`);
if(failures.length){console.error("Privacy cache guard failed:\n- "+failures.join("\n- "));process.exit(1)}console.log("Privacy cache guard passed: authenticated memory surfaces and APIs are private/no-store.");
