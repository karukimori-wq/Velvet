import fs from "node:fs";
const phase=fs.readFileSync("lib/recall-phase.ts","utf8"),visits=fs.readFileSync("lib/professional-visit-repository.ts","utf8"),page=fs.readFileSync("app/capture/page.tsx","utf8");
const required=[[phase,'visitCount<=2',"1-2 visits"],[phase,'visitCount<=5',"3-5 visits"],[phase,'daysSinceLastVisit>=180',"long-gap resurfacing"],[phase,'"established"',"6+ visits"],[visits,"listProfessionalVisits","visit history reader"],[page,"getRecallPhase(visits)","phase wired"],[page,"presentation.ongoingLimit","display weighting"]];
const failures=required.filter(([t,n])=>!t.includes(n)).map(([,n,l])=>`${l}: ${n}`);if(failures.length){console.error(failures.join("\n"));process.exit(1)}console.log("Recall weighting check passed.");
