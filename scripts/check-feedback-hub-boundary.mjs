import fs from 'node:fs';

const route=fs.readFileSync('app/api/feedback/route.ts','utf8');
const launcher=fs.readFileSync('components/feedback-hub-launcher.tsx','utf8');
const contracts=fs.readFileSync('app/api/contracts/status/route.ts','utf8');

const required=[
  ['route app id','appId:APP_ID'],
  ['workspace identity','workspaceId:identity.workspaceId'],
  ['owner identity','ownerUserId:identity.ownerUserId'],
  ['screen context','screenName:'],
  ['occurredAt','occurredAt:new Date().toISOString()'],
  ['initial message','initialMessage'],
  ['embed endpoint','/api/embed/feedback'],
  ['intake fallback','/api/feedback/intake'],
  ['trace propagation','x-trace-id'],
  ['minimal references','minimalReferences'],
];
for(const [label,needle] of required){if(!route.includes(needle))throw new Error(`Feedback Hub contract missing: ${label}`)}

const forbiddenPayloadPatterns=[
  /fullProfessionalMemory/i,/fullNotes/i,/fullConversationHistory/i,/paymentStatus\s*:/i,/salesAmount\s*:/i,/stripeSecret\s*:/i,/apiKey\s*:/i,/secretPrompt\s*:/i,
];
for(const pattern of forbiddenPayloadPatterns){if(pattern.test(route))throw new Error(`Feedback payload contains prohibited field pattern: ${pattern}`)}

if(!launcher.includes('Professional Memoryやメモ本文を自動で丸ごと送ることはありません'))throw new Error('Feedback privacy disclosure missing');
if(!contracts.includes('feedbackHubBoundary'))throw new Error('Feedback Hub responsibility boundary missing from contracts status');
if(!contracts.includes('referenceOnly: true'))throw new Error('Feedback Hub reference-only rule missing');
console.log('Feedback Hub boundary check passed');
