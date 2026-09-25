import type { OngoingTopic } from "@/lib/ongoing-topic-repository";
export type NextActionCandidate={sourceTopicId:string;topicId:string;text:string;actionType:string};
export function suggestNextActionsFromTopic(topic:Pick<OngoingTopic,"topicId"|"label"|"latestContent"|"state">):NextActionCandidate[]{
 if(topic.state==="done")return[];
 const text=topic.latestContent.trim(),id=topic.topicId;
 if(id==="topic.travel"||/旅行|温泉|出張/.test(text))return[{sourceTopicId:id,topicId:"action.ask.follow_up",text:"旅行どうだった？と聞く",actionType:"action.ask"}];
 if(/exam|school/.test(id)||/受験|試験/.test(text))return[{sourceTopicId:id,topicId:"action.ask.result",text:"結果を聞く",actionType:"action.ask"}];
 if(/birthday/.test(id)||/誕生日/.test(text))return[{sourceTopicId:id,topicId:"action.care",text:"誕生日を覚えておく",actionType:"action.care"}];
 return[{sourceTopicId:id,topicId:"action.ask.follow_up",text:`${topic.label}のその後を聞く`,actionType:"action.ask"}];
}
