import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listPersonContacts } from "@/lib/contact-repository";
import { getPersonProfile, listAllPersonProfiles } from "@/lib/person-profile-repository";
import { getPersonStore } from "@/lib/person-store";
import { addContactAction, addKnowledgeAction, deleteContactAction, updatePersonAction, updatePersonProfileAction } from "../../actions";

const contactLabels: Record<string, string> = {
  phone: "電話", email: "メール", line: "LINE", instagram: "Instagram", x: "X", tiktok: "TikTok", other: "その他",
};

const unique = (values: Array<string | undefined>) => Array.from(new Set(values.filter(Boolean) as string[]));

export default async function EditPersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const { ownerUserId } = await getRequestIdentity();
  const person = await getPersonStore(personId, ownerUserId);
  if (!person) notFound();
  const [contacts, profile, allProfiles] = await Promise.all([
    listPersonContacts(personId, ownerUserId),
    getPersonProfile(personId, ownerUserId),
    listAllPersonProfiles(ownerUserId),
  ]);
  const occupationSuggestions = unique(allProfiles.map((item) => item.occupation));
  const companySuggestions = unique(allProfiles.map((item) => item.company));
  const areaSuggestions = unique(allProfiles.map((item) => item.area));

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href={`/people/${person.id}`}>‹ 戻る</Link><span className="subtle">編集</span></header>
      <section className="hero"><h1>{person.name}</h1><p>確認画面には入力済みだけ表示します。追加したい時だけ開きます。</p></section>
      <form action={updatePersonAction.bind(null, person.id)} className="stack">
        <label className="fieldLabel" htmlFor="name">名前</label>
        <input id="name" name="name" className="searchBox" defaultValue={person.name} autoComplete="off" />
        {person.rank && <label className="fieldLabel" htmlFor="rank">ランク</label>}
        <input id="rank" name="rank" className="searchBox" defaultValue={person.rank ?? ""} placeholder={person.rank ? undefined : "ランクを追加する場合だけ入力"} autoComplete="off" />
        <button className="secondaryButton" type="submit">基本情報を更新</button>
      </form>

      <details className="detailsCard" open={Boolean(profile)}>
        <summary>{profile ? "基本プロフィールを編集" : "基本プロフィールを追加"}</summary>
        <form action={updatePersonProfileAction.bind(null, person.id)} className="stack detailsBody">
          <input className="searchBox" name="occupation" list="occupation-suggestions" defaultValue={profile?.occupation ?? ""} placeholder="職業（任意）" autoComplete="off" />
          <datalist id="occupation-suggestions">{occupationSuggestions.map((value) => <option value={value} key={value} />)}</datalist>
          <input className="searchBox" name="company" list="company-suggestions" defaultValue={profile?.company ?? ""} placeholder="会社・勤務先（任意）" autoComplete="off" />
          <datalist id="company-suggestions">{companySuggestions.map((value) => <option value={value} key={value} />)}</datalist>
          <input className="searchBox" name="area" list="area-suggestions" defaultValue={profile?.area ?? ""} placeholder="住んでいる/活動エリア（任意）" autoComplete="off" />
          <datalist id="area-suggestions">{areaSuggestions.map((value) => <option value={value} key={value} />)}</datalist>
          <div className="formHint">過去に入力した職業・会社・エリアは候補として再利用されます。</div>
          <label className="fieldLabel" htmlFor="birthDate">生年月日（任意）</label>
          <input id="birthDate" className="searchBox" type="date" name="birthDate" defaultValue={profile?.birthDate ?? ""} />
          <select className="selectBox" name="maritalStatus" defaultValue={profile?.maritalStatus ?? ""}>
            <option value="">婚姻状況は登録しない</option>
            <option value="unmarried">未婚</option>
            <option value="married">既婚</option>
            <option value="unknown">不明</option>
          </select>
          <button className="secondaryButton" type="submit">プロフィールを保存</button>
        </form>
      </details>

      {person.personality.length > 0 && <><div className="sectionTitle">パーソナリティ</div><div className="chips">{person.personality.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}
      <form action={addKnowledgeAction.bind(null, person.id)} className="stack compactForm">
        <label className="fieldLabel" htmlFor="value">記憶を追加</label>
        <input id="value" name="value" className="searchBox" placeholder="例：黒髪、ロレックス、ゴルフ" autoComplete="off" />
        <div className="formHint">「、」区切りでまとめて追加できます。</div>
        <button className="primaryButton" type="submit">追加</button>
      </form>

      {contacts.length > 0 && <>
        <div className="sectionTitle">登録済み連絡先</div>
        <div className="stack">{contacts.map((contact) => (
          <div className="card row" key={contact.id}><div><div className="timelineTitle">{contactLabels[contact.type]}{contact.isPrimary ? " · メイン" : ""}</div><div className="timelineBody">{contact.value}</div></div><form action={deleteContactAction.bind(null, person.id, contact.id)}><button className="subtle" type="submit">削除</button></form></div>
        ))}</div>
      </>}

      <details className="detailsCard">
        <summary>連絡先を追加</summary>
        <form action={addContactAction.bind(null, person.id)} className="stack detailsBody">
          <select className="selectBox" name="type" defaultValue="line">
            <option value="line">LINE</option><option value="instagram">Instagram</option><option value="phone">電話</option><option value="email">メール</option><option value="x">X</option><option value="tiktok">TikTok</option><option value="other">その他</option>
          </select>
          <input className="searchBox" name="value" placeholder="ID・電話番号・メール等" autoComplete="off" />
          <input className="searchBox" name="label" placeholder="補足（任意）" autoComplete="off" />
          <label className="choiceChip"><input type="checkbox" name="isPrimary" /> この種類のメイン連絡先</label>
          <button className="secondaryButton" type="submit">追加</button>
        </form>
      </details>
    </main>
  );
}
