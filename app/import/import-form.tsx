"use client";

import { useMemo, useState } from "react";
import { importJsonAction } from "./actions";

const example = `{
  "version": "1.0",
  "people": [
    {
      "name": "山田さん",
      "rank": "VIP",
      "personality": ["会社経営", "既婚", "ゴルフ", "ロレックス"],
      "contacts": [
        { "type": "line", "value": "yamada_line", "isPrimary": true },
        { "type": "instagram", "value": "@yamada" }
      ]
    }
  ]
}`;

type PreviewContact = { type?: string; value?: string };
type PreviewPerson = { name: string; rank?: string; personality?: string[]; contacts?: PreviewContact[] };

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("ja-JP");
}

export function ImportForm({ existingNames }: { existingNames: string[] }) {
  const [raw, setRaw] = useState(example);
  const existing = useMemo(() => new Set(existingNames.map(normalize)), [existingNames]);

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(raw) as { version?: unknown; people?: unknown };
      if (parsed.version !== "1.0" || !Array.isArray(parsed.people)) return { valid: false as const, message: "version 1.0 と people 配列が必要です。" };
      const people: PreviewPerson[] = [];
      for (const item of parsed.people) {
        if (!item || typeof item !== "object" || typeof (item as PreviewPerson).name !== "string" || !(item as PreviewPerson).name.trim()) {
          return { valid: false as const, message: "名前がないデータがあります。" };
        }
        people.push(item as PreviewPerson);
      }
      const duplicates = people.filter((person) => existing.has(normalize(person.name)));
      const contactCount = people.reduce((sum, person) => sum + (Array.isArray(person.contacts) ? person.contacts.length : 0), 0);
      return { valid: true as const, people, duplicates, contactCount };
    } catch {
      return { valid: false as const, message: "JSON形式を確認してください。" };
    }
  }, [raw, existing]);

  return (
    <form action={importJsonAction} className="stack">
      <textarea className="searchBox importArea" name="json" value={raw} onChange={(event) => setRaw(event.target.value)} />

      {preview.valid ? (
        <div className="card">
          <div className="timelineTitle">登録前の確認 · {preview.people.length}人</div>
          <div className="timelineBody">{preview.people.slice(0, 6).map((person) => person.name).join(" · ")}{preview.people.length > 6 ? " …" : ""}</div>
          {preview.contactCount > 0 && <div className="formHint">連絡先 {preview.contactCount}件も復元します。</div>}
          {preview.duplicates.length > 0 && <div className="formHint">同名候補 {preview.duplicates.length}人：{preview.duplicates.slice(0, 5).map((person) => person.name).join(" · ")}</div>}
        </div>
      ) : (
        <div className="formError">{preview.message}</div>
      )}

      <div className="sectionTitle">同じ名前がある場合</div>
      <div className="chips choiceRow">
        <label className="choiceChip"><input type="radio" name="duplicatePolicy" value="skip" defaultChecked />スキップ</label>
        <label className="choiceChip"><input type="radio" name="duplicatePolicy" value="create_separate" />別人として登録</label>
      </div>
      <div className="formHint">似ている名前だけで自動統合はしません。</div>

      <button className="primaryButton" type="submit" disabled={!preview.valid}>この内容で登録</button>
    </form>
  );
}
