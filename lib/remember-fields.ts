import type { CaptureKind } from "@/lib/capture-repository";

export type RememberField={label:string;kind:CaptureKind;examples:string[]};
export type RememberGroup={title:string;hint?:string;fields:RememberField[]};

export const rememberGroups:RememberGroup[]=[
 {title:"見た目",hint:"次に会った時に見分けやすい特徴",fields:[
  {label:"髪",kind:"appearance",examples:["黒髪","茶髪","白髪","金髪","短髪","長髪"]},
  {label:"メガネ",kind:"appearance",examples:["あり","なし","黒フレーム","細フレーム"]},
  {label:"顔の特徴",kind:"appearance",examples:["ヒゲ","色白","えくぼ","日焼け"]},
  {label:"体格・雰囲気",kind:"appearance",examples:["細身","がっしり","長身","落ち着いた雰囲気"]},
  {label:"髪型・変化",kind:"appearance",examples:["パーマ","刈り上げ","いつも帽子"]}
 ]},
 {title:"服装・持ち物",hint:"よく身につけているもの",fields:[
  {label:"服装",kind:"appearance",examples:["スーツ","カジュアル","きれいめ","スポーティ"]},
  {label:"時計",kind:"accessory",examples:["ロレックス","オメガ","Apple Watch","なし"]},
  {label:"財布",kind:"accessory",examples:["ヴィトン","エルメス","グッチ"]},
  {label:"バッグ",kind:"accessory",examples:["トート","クラッチ","リュック"]},
  {label:"靴",kind:"accessory",examples:["革靴","スニーカー","ブーツ"]},
  {label:"アクセサリー",kind:"accessory",examples:["指輪","ネックレス","ブレスレット","なし"]},
  {label:"香り",kind:"appearance",examples:["香水あり","香水なし","タバコの香り"]}
 ]},
 {title:"仕事・生活",hint:"会話を続けやすくする背景",fields:[
  {label:"仕事",kind:"work",examples:["会社経営","会社員","自営業","医療","建設"]},
  {label:"業界・仕事内容",kind:"work",examples:["営業","経営","現場仕事","出張が多い"]},
  {label:"働き方",kind:"work",examples:["平日勤務","夜勤あり","シフト制","出張多め"]},
  {label:"出身",kind:"knowledge",examples:[]},
  {label:"よく行く場所",kind:"knowledge",examples:["東京","大阪","ゴルフ場","出張先"]},
  {label:"休日の過ごし方",kind:"hobby",examples:["家で過ごす","旅行","ゴルフ","家族と過ごす"]}
 ]},
 {title:"人となり・家族",fields:[
  {label:"人柄",kind:"knowledge",examples:["話好き","静か","気さく","慎重","せっかち"]},
  {label:"話し方",kind:"knowledge",examples:["よく話す","聞き役","冗談が多い","ゆっくり話す"]},
  {label:"結婚",kind:"marital_status",examples:["既婚","未婚","不明"]},
  {label:"家族",kind:"knowledge",examples:["娘がいる","息子がいる","孫がいる"]},
  {label:"ペット",kind:"knowledge",examples:["犬","猫","飼っていない"]},
  {label:"大切にしていること",kind:"knowledge",examples:["家族","仕事","趣味","健康"]}
 ]},
 {title:"趣味・関心",hint:"次の会話のきっかけになること",fields:[
  {label:"趣味",kind:"hobby",examples:["ゴルフ","旅行","釣り","車","サウナ"]},
  {label:"スポーツ",kind:"hobby",examples:["野球","サッカー","ゴルフ","格闘技"]},
  {label:"音楽",kind:"hobby",examples:["邦楽","洋楽","昭和歌謡","ライブ"]},
  {label:"映画・ドラマ",kind:"hobby",examples:["映画好き","韓国ドラマ","Netflix"]},
  {label:"車",kind:"hobby",examples:["車好き","国産車","輸入車"]},
  {label:"旅行",kind:"hobby",examples:["国内旅行","海外旅行","温泉"]},
  {label:"最近ハマっていること",kind:"hobby",examples:[]}
 ]},
 {title:"飲食・好み",hint:"注文や会話で役立つこと",fields:[
  {label:"よく飲むもの",kind:"drink",examples:["ビール","ハイボール","白州","焼酎","ワイン"]},
  {label:"お酒の強さ",kind:"drink",examples:["強い","普通","弱い","飲まない"]},
  {label:"好きな食べ物",kind:"knowledge",examples:["肉","寿司","甘いもの","辛いもの"]},
  {label:"苦手な食べ物",kind:"knowledge",examples:["甘いもの","辛いもの","生もの"]},
  {label:"好きな店・場所",kind:"knowledge",examples:["寿司","焼肉","バー","温泉"]},
  {label:"好きなブランド",kind:"knowledge",examples:["ロレックス","ヴィトン","エルメス"]},
  {label:"その他の好み",kind:"hobby",examples:["甘いもの好き","犬好き","旅行好き"]}
 ]},
 {title:"接客の好み",hint:"その人に合った接し方を思い出す",fields:[
  {label:"着席理由",kind:"knowledge",examples:["新規","指名","場内指名","ヘルプ","同伴","フリー"]},
  {label:"会話の好み",kind:"knowledge",examples:["聞いてほしい","盛り上がりたい","静かに話したい","仕事の話が好き"]},
  {label:"接客の距離感",kind:"knowledge",examples:["フレンドリー","丁寧","落ち着いて","テンポよく"]},
  {label:"よく話す話題",kind:"conversation_note",examples:["仕事","家族","趣味","旅行"]},
  {label:"避けたい話題",kind:"knowledge",examples:["仕事の愚痴","家族","お金"]},
  {label:"注意点",kind:"knowledge",examples:["お酒弱め","急かさない","苦手な話題あり"]}
 ]},
 {title:"次につなげる",hint:"次に会った時に思い出したいこと",fields:[
  {label:"次に聞きたいこと",kind:"conversation_note",examples:["出張どうだった？","ゴルフどうだった？"]},
  {label:"気にしていること",kind:"knowledge",examples:["仕事","家族","健康","趣味"]},
  {label:"最近の出来事",kind:"conversation_note",examples:["旅行に行った","仕事が忙しい","車を買った"]},
  {label:"約束・覚えておくこと",kind:"conversation_note",examples:["次回写真を見る","おすすめを教える"]}
 ]}
];

export const rememberPreviewGroups=rememberGroups.map(group=>({title:group.title,labels:group.fields.map(field=>field.label)}));
