import type { CaptureKind } from "@/lib/capture-repository";

export type RememberSectionId = "profile" | "conversation" | "next_action";
export type RememberField = { label: string; kind: CaptureKind; topicId: string; examples: string[] };
export type RememberGroup = { title: string; hint?: string; fields: RememberField[] };
export type RememberSection = { id: RememberSectionId; title: string; shortTitle: string; hint: string; groups: RememberGroup[] };

const f = (label: string, kind: CaptureKind, topicId: string, examples: string[] = []): RememberField => ({ label, kind, topicId, examples });

export const profileRememberGroups: RememberGroup[] = [
  { title: "見た目・雰囲気", hint: "次に会った時に見分けやすい特徴", fields: [
    f("髪・髪型", "appearance", "appearance.hair", ["黒髪", "茶髪", "白髪", "短髪", "長髪", "パーマ", "刈り上げ"]),
    f("顔・表情", "appearance", "appearance.face", ["ヒゲ", "色白", "えくぼ", "日焼け", "笑顔が多い", "落ち着いた表情"]),
    f("体格", "appearance", "appearance.body", ["細身", "がっしり", "長身", "小柄"]),
    f("メガネ", "appearance", "appearance.glasses", ["あり", "なし", "黒フレーム", "細フレーム"]),
    f("声・話し方", "appearance", "appearance.voice", ["声が低い", "よく話す", "聞き役", "ゆっくり話す", "冗談が多い"]),
    f("香り", "appearance", "appearance.scent", ["香水あり", "香水なし", "タバコの香り"]),
    f("第一印象・雰囲気", "appearance", "appearance.impression", ["落ち着いた雰囲気", "明るい", "静か", "気さく", "緊張していた"]),
    f("見分ける特徴", "appearance", "appearance.identifying_feature", [])
  ] },
  { title: "基本情報", fields: [
    f("出身", "knowledge", "profile.hometown"),
    f("年齢・世代", "knowledge", "profile.age_band"),
    f("誕生日", "knowledge", "profile.birthday"),
    f("住まい", "knowledge", "profile.home_area"),
    f("来店理由", "knowledge", "profile.visit_reason", ["新規", "指名", "場内指名", "ヘルプ", "同伴", "フリー"])
  ] },
  { title: "仕事・生活", hint: "会話を続けやすくする背景", fields: [
    f("会社・勤務先", "work", "work.company"),
    f("業界", "work", "work.industry", ["医療", "建設", "不動産", "飲食", "IT", "金融"]),
    f("職種", "work", "work.role", ["営業", "経営", "現場仕事", "事務", "接客"]),
    f("役職", "work", "work.position", ["経営者", "役員", "管理職", "責任者"]),
    f("経営・自営業", "work", "work.owner", ["会社経営", "自営業", "独立している"]),
    f("働き方", "work", "work.style", ["平日勤務", "夜勤あり", "シフト制", "出張多め", "在宅あり"]),
    f("勤務時間", "work", "work.hours"),
    f("休日", "work", "work.days_off", ["土日休み", "平日休み", "不定休"]),
    f("出張", "work", "work.business_trip", ["出張が多い", "東京出張", "大阪出張", "海外出張"]),
    f("転勤", "work", "work.transfer"),
    f("忙しい時期", "work", "work.busy_season"),
    f("通勤・移動手段", "work", "work.commute", ["車", "電車", "タクシー", "徒歩"]),
    f("生活リズム", "knowledge", "life.rhythm", ["朝型", "夜型", "忙しい", "不規則"]),
    f("よく行く場所", "knowledge", "life.frequent_place", ["東京", "大阪", "ゴルフ場", "出張先"]),
    f("休日の過ごし方", "hobby", "life.weekend", ["家で過ごす", "旅行", "ゴルフ", "家族と過ごす"])
  ] },
  { title: "性格・人柄", fields: [
    f("性格", "knowledge", "personality.trait", ["話好き", "静か", "気さく", "慎重", "せっかち", "優しい"]),
    f("大切にしていること", "knowledge", "values.important", ["家族", "仕事", "趣味", "健康", "約束"]),
    f("こだわり", "knowledge", "values.preference"),
    f("苦手なこと", "knowledge", "values.dislike")
  ] },
  { title: "家族・人間関係", fields: [
    f("結婚", "marital_status", "family.marital", ["既婚", "未婚", "不明"]),
    f("配偶者", "knowledge", "family.partner"),
    f("子ども", "knowledge", "family.children", ["娘がいる", "息子がいる", "子どもはいない"]),
    f("孫", "knowledge", "family.grandchild"),
    f("親・兄弟", "knowledge", "family.parents_siblings"),
    f("友人・同僚", "knowledge", "relationship.friends"),
    f("ペット", "knowledge", "family.pet", ["犬", "猫", "飼っていない"])
  ] },
  { title: "趣味・好きなこと", hint: "次の会話のきっかけになること", fields: [
    f("趣味", "hobby", "hobby.general", ["ゴルフ", "旅行", "釣り", "車", "サウナ"]),
    f("スポーツ", "hobby", "hobby.sports", ["野球", "サッカー", "ゴルフ", "格闘技"]),
    f("ゴルフ", "hobby", "hobby.golf", ["よく行く", "始めたばかり", "コンペ", "スコア"]),
    f("車", "hobby", "hobby.car", ["車好き", "国産車", "輸入車", "車を買った"]),
    f("釣り", "hobby", "hobby.fishing"),
    f("サウナ", "hobby", "hobby.sauna"),
    f("旅行", "hobby", "topic.travel", ["国内旅行", "海外旅行", "温泉", "北海道", "沖縄"]),
    f("音楽", "hobby", "hobby.music", ["邦楽", "洋楽", "昭和歌謡", "ライブ"]),
    f("映画・ドラマ", "hobby", "hobby.movies", ["映画好き", "韓国ドラマ", "Netflix"]),
    f("アニメ・ゲーム", "hobby", "hobby.anime_game"),
    f("読書・カメラ", "hobby", "hobby.reading_camera"),
    f("アウトドア", "hobby", "hobby.outdoor"),
    f("料理・食べ歩き", "hobby", "hobby.food_tour"),
    f("最近ハマっていること", "hobby", "hobby.current_interest")
  ] },
  { title: "食事・お酒", hint: "注文や会話で役立つこと", fields: [
    f("よく飲むもの", "drink", "food.drink", ["ビール", "ハイボール", "白州", "焼酎", "ワイン"]),
    f("お酒の強さ", "drink", "food.alcohol_tolerance", ["強い", "普通", "弱い", "飲まない"]),
    f("好きな食べ物", "knowledge", "food.like", ["肉", "寿司", "甘いもの", "辛いもの"]),
    f("苦手な食べ物", "knowledge", "food.dislike", ["甘いもの", "辛いもの", "生もの"]),
    f("好きな店・場所", "knowledge", "food.place", ["寿司", "焼肉", "バー", "温泉"])
  ] },
  { title: "ブランド・持ち物・消費", fields: [
    f("服装", "appearance", "item.clothing", ["スーツ", "カジュアル", "きれいめ", "スポーティ"]),
    f("ファッション", "appearance", "item.fashion"),
    f("時計", "accessory", "item.watch", ["ロレックス", "オメガ", "Apple Watch", "なし"]),
    f("財布", "accessory", "item.wallet", ["ヴィトン", "エルメス", "グッチ"]),
    f("バッグ", "accessory", "item.bag", ["トート", "クラッチ", "リュック"]),
    f("靴", "accessory", "item.shoes", ["革靴", "スニーカー", "ブーツ"]),
    f("アクセサリー", "accessory", "item.accessory", ["指輪", "ネックレス", "ブレスレット", "なし"]),
    f("好きなブランド", "knowledge", "item.brand", ["ロレックス", "ヴィトン", "エルメス"]),
    f("買い物・消費", "knowledge", "item.purchase")
  ] },
  { title: "接し方・コミュニケーション", hint: "その人に合った接し方を思い出す", fields: [
    f("会話の好み", "knowledge", "communication.preference", ["聞いてほしい", "盛り上がりたい", "静かに話したい", "仕事の話が好き"]),
    f("接客の距離感", "knowledge", "communication.distance", ["フレンドリー", "丁寧", "落ち着いて", "テンポよく"]),
    f("よく話す話題", "conversation_note", "communication.topic", ["仕事", "家族", "趣味", "旅行"]),
    f("避けたい話題", "knowledge", "communication.avoid", ["仕事の愚痴", "家族", "お金"]),
    f("注意点", "knowledge", "communication.caution", ["お酒弱め", "急かさない", "苦手な話題あり"])
  ] }
];

export const conversationRememberGroups: RememberGroup[] = [
  { title: "仕事", fields: [
    f("忙しい", "conversation_note", "conversation.work.busy"),
    f("仕事が順調", "conversation_note", "conversation.work.good"),
    f("仕事の悩み", "conversation_note", "conversation.work.concern"),
    f("昇進", "conversation_note", "conversation.work.promotion"),
    f("転職", "conversation_note", "conversation.work.job_change"),
    f("独立", "conversation_note", "conversation.work.independent"),
    f("出張", "conversation_note", "conversation.work.business_trip"),
    f("新しい仕事", "conversation_note", "conversation.work.new_job"),
    f("人間関係", "conversation_note", "conversation.work.relationship"),
    f("成功した", "conversation_note", "conversation.work.success"),
    f("失敗した", "conversation_note", "conversation.work.failure"),
    f("今後の予定", "conversation_note", "conversation.work.plan")
  ] },
  { title: "家族", fields: [
    f("配偶者", "conversation_note", "conversation.family.partner"),
    f("子ども", "conversation_note", "conversation.family.children"),
    f("孫", "conversation_note", "conversation.family.grandchild"),
    f("親", "conversation_note", "conversation.family.parent"),
    f("兄弟", "conversation_note", "conversation.family.sibling"),
    f("家族旅行", "conversation_note", "topic.travel"),
    f("学校・受験", "conversation_note", "conversation.family.school_exam"),
    f("就職・結婚・出産", "conversation_note", "conversation.family.life_event"),
    f("家族の悩み", "conversation_note", "conversation.family.concern"),
    f("家族イベント", "conversation_note", "conversation.family.event")
  ] },
  { title: "恋愛・人間関係", fields: [
    f("恋愛", "conversation_note", "conversation.relationship.love"),
    f("友人", "conversation_note", "conversation.relationship.friend"),
    f("職場の人", "conversation_note", "conversation.relationship.work_person"),
    f("相談された", "conversation_note", "conversation.relationship.consulted"),
    f("距離感", "conversation_note", "conversation.relationship.distance")
  ] },
  { title: "趣味・遊び", fields: [
    f("旅行", "conversation_note", "topic.travel", ["北海道旅行", "温泉", "出張ついで", "旅行予定"]),
    f("ゴルフ", "conversation_note", "hobby.golf"),
    f("車", "conversation_note", "hobby.car"),
    f("サウナ", "conversation_note", "hobby.sauna"),
    f("映画・ドラマ", "conversation_note", "hobby.movies"),
    f("食べ歩き", "conversation_note", "hobby.food_tour")
  ] },
  { title: "最近の出来事", fields: [
    f("行った", "conversation_note", "conversation.event.went"),
    f("買った", "conversation_note", "conversation.event.bought"),
    f("始めた", "conversation_note", "conversation.event.started"),
    f("やめた", "conversation_note", "conversation.event.stopped"),
    f("決めた", "conversation_note", "conversation.event.decided"),
    f("変えた", "conversation_note", "conversation.event.changed"),
    f("成功した", "conversation_note", "conversation.event.success"),
    f("失敗した", "conversation_note", "conversation.event.failure"),
    f("もらった", "conversation_note", "conversation.event.received"),
    f("引っ越した", "conversation_note", "conversation.event.moved"),
    f("車を買った", "conversation_note", "hobby.car"),
    f("転職した", "conversation_note", "conversation.work.job_change")
  ] },
  { title: "予定", fields: [
    f("旅行予定", "conversation_note", "topic.travel"),
    f("出張予定", "conversation_note", "conversation.plan.business_trip"),
    f("受験予定", "conversation_note", "conversation.plan.exam"),
    f("イベント予定", "conversation_note", "conversation.plan.event"),
    f("来店予定", "conversation_note", "conversation.plan.visit")
  ] },
  { title: "悩み・感情", fields: [
    f("悩み・相談", "conversation_note", "conversation.concern"),
    f("嬉しかったこと", "conversation_note", "conversation.emotion.happy"),
    f("困っていること", "conversation_note", "conversation.emotion.trouble"),
    f("楽しみ", "conversation_note", "conversation.emotion.excited"),
    f("不安", "conversation_note", "conversation.emotion.anxious"),
    f("疲れている", "conversation_note", "conversation.emotion.tired")
  ] },
  { title: "会話の状態", hint: "話題の時間的なつながりを残します", fields: [
    f("NEW", "conversation_note", "conversation.status.new", ["初めて聞いた", "新しい話題"]),
    f("継続", "conversation_note", "conversation.status.continued", ["前回の続き", "まだ継続中", "次回も聞く"]),
    f("変化あり", "conversation_note", "conversation.status.changed", ["進展あり", "変化あり", "結果が出た"]),
    f("完了", "conversation_note", "conversation.status.done", ["解決した", "終わった", "合格した"]),
    f("重要", "conversation_note", "conversation.status.important"),
    f("盛り上がった", "conversation_note", "conversation.status.excited"),
    f("深掘りした", "conversation_note", "conversation.status.deep"),
    f("触れない方がよい", "conversation_note", "conversation.status.avoid")
  ] },
  { title: "人物・場所・もの", fields: [
    f("人物", "conversation_note", "conversation.entity.person"),
    f("場所", "conversation_note", "conversation.entity.place"),
    f("もの", "conversation_note", "conversation.entity.item")
  ] }
];

export const nextActionRememberGroups: RememberGroup[] = [
  { title: "聞く", fields: [
    f("その後どう？", "conversation_note", "action.ask.follow_up", ["その後どう？", "結果どうだった？"]),
    f("結果を聞く", "conversation_note", "action.ask.result"),
    f("進捗を聞く", "conversation_note", "action.ask.progress"),
    f("仕事", "conversation_note", "action.ask.work"),
    f("家族", "conversation_note", "action.ask.family"),
    f("恋愛", "conversation_note", "action.ask.love"),
    f("旅行", "conversation_note", "topic.travel", ["北海道どうだった？", "旅行どうだった？"]),
    f("趣味", "conversation_note", "action.ask.hobby"),
    f("ゴルフ", "conversation_note", "hobby.golf", ["ゴルフどうだった？"]),
    f("体調", "conversation_note", "action.ask.health"),
    f("前回の相談", "conversation_note", "action.ask.previous_consultation"),
    f("前回の約束", "conversation_note", "action.ask.previous_promise")
  ] },
  { title: "連絡する", fields: [
    f("LINE", "conversation_note", "action.contact.line"),
    f("電話", "conversation_note", "action.contact.phone"),
    f("メッセージ", "conversation_note", "action.contact.message"),
    f("お礼", "conversation_note", "action.contact.thanks"),
    f("誕生日", "conversation_note", "action.contact.birthday"),
    f("イベント案内", "conversation_note", "action.contact.event"),
    f("来店後フォロー", "conversation_note", "action.contact.after_visit"),
    f("久しぶりの連絡", "conversation_note", "action.contact.long_time"),
    f("旅行後", "conversation_note", "topic.travel"),
    f("体調確認", "conversation_note", "action.contact.health"),
    f("結果確認", "conversation_note", "action.contact.result")
  ] },
  { title: "伝える・誘う", fields: [
    f("伝える", "conversation_note", "action.tell"),
    f("おすすめを伝える", "conversation_note", "action.tell.recommendation"),
    f("誘う", "conversation_note", "action.invite"),
    f("店に誘う", "conversation_note", "action.invite.store"),
    f("イベントに誘う", "conversation_note", "action.invite.event")
  ] },
  { title: "準備する", fields: [
    f("プレゼント", "conversation_note", "action.prepare.gift"),
    f("好きなお酒", "conversation_note", "action.prepare.drink"),
    f("好きな食べ物", "conversation_note", "action.prepare.food"),
    f("席", "conversation_note", "action.prepare.seat"),
    f("話題", "conversation_note", "action.prepare.topic"),
    f("情報", "conversation_note", "action.prepare.info"),
    f("写真", "conversation_note", "action.prepare.photo"),
    f("店", "conversation_note", "action.prepare.place"),
    f("予約", "conversation_note", "action.prepare.reservation"),
    f("サプライズ", "conversation_note", "action.prepare.surprise"),
    f("誕生日", "conversation_note", "action.prepare.birthday"),
    f("お祝い", "conversation_note", "action.prepare.celebration")
  ] },
  { title: "覚えておく・確認する", fields: [
    f("覚えておく", "conversation_note", "action.remember"),
    f("確認する", "conversation_note", "action.confirm"),
    f("お祝い・気遣い", "conversation_note", "action.care"),
    f("調べる", "conversation_note", "action.research"),
    f("次回の会話", "conversation_note", "action.next_conversation")
  ] },
  { title: "期限・状態", hint: "必要な時だけ短く足します", fields: [
    f("期限", "conversation_note", "action.meta.deadline"),
    f("次回来店時", "conversation_note", "action.meta.next_visit", ["次回来店時"]),
    f("日付", "conversation_note", "action.meta.date"),
    f("優先度", "conversation_note", "action.meta.priority", ["高", "中", "低"]),
    f("完了", "conversation_note", "action.meta.done"),
    f("キャンセル", "conversation_note", "action.meta.cancelled")
  ] }
];

export function getRememberSections(phase: "first" | "repeat" = "repeat"): RememberSection[] {
  const profile: RememberSection = { id: "profile", title: "人物情報", shortTitle: "人物情報", hint: "見た目・仕事・趣味・好みなど", groups: profileRememberGroups };
  const conversation: RememberSection = { id: "conversation", title: "今日の会話", shortTitle: "今日の会話", hint: "前回の続きや今日話したこと", groups: conversationRememberGroups };
  const nextAction: RememberSection = { id: "next_action", title: "次のアクション", shortTitle: "次につなげる", hint: "次に聞く・連絡する・準備する", groups: nextActionRememberGroups };
  return phase === "first" ? [profile, conversation, nextAction] : [conversation, nextAction, profile];
}

export const rememberGroups: RememberGroup[] = [...profileRememberGroups, ...conversationRememberGroups, ...nextActionRememberGroups];
export const rememberPreviewGroups = getRememberSections("repeat").map(section => ({ title: section.title, labels: section.groups.flatMap(group => group.fields.map(field => field.label)) }));
