"use client";

import { useMemo, useState } from "react";
import { importJsonAction } from "./actions";

const example = `{
  "version": "2.0",
  "memories": [
    {
      "customerId": "customer_123",
      "preferenceNote": "響が好き。ゴルフの話題が多い。",
      "cautionNote": "仕事の話を詮索しすぎない。",
      "lastInteractionSummary": "大阪出張と犬の話。",
      "nextTopicHint": "大阪出張どうだったか聞く",
      "tags": ["ゴルフ", "響", "ロレックス"],
      "pinned": true
    }
  ]
}`;

type PreviewMemory = { customerId: string; tags?: string[] };

export function ImportForm() {
  const [raw, setRaw] = useState(example);
  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(raw) as { version?: unknown; memories?: unknown };
      if (parsed.version !== "2.0" || !Array.isArray(parsed.memories)) return { valid: false as const, message: "version 2.0 と memories 配列が必要です。" };
      const memories: PreviewMemory[] = [];
      for (const item of parsed.memories) {
        if (!item || typeof item !== "object" || typeof (item as PreviewMemory).customerId !== "string" || !(item as PreviewMemory).customerId.trim()) {
          return { valid: false as const, message: "customerId がないデータがあります。" };
        }
        memories.push(item as PreviewMemory);
      }
      return { valid: true as const, memories };
    } catch {
      return { valid: false as const, message: "JSON形式を確認してください。" };
    }
  }, [raw]);

  return <form action={importJsonAction} className="stack">
    <textarea className="searchBox importArea" name="json" value={raw} onChange={(event) => setRaw(event.target.value)} />
    {preview.valid ? <div className="card"><div className="timelineTitle">登録前の確認 · {preview.memories.length}件</div><div className="timelineBody">{preview.memories.slice(0, 6).map((memory) => memory.customerId).join(" · ")}{preview.memories.length > 6 ? " …" : ""}</div><div className="formHint">Customer自体は作成・更新しません。customerIdにVelvetの専門メモだけを紐づけます。</div></div> : <div className="formError">{preview.message}</div>}
    <button className="primaryButton" type="submit" disabled={!preview.valid}>この内容でメモを登録</button>
  </form>;
}
