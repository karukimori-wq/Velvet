"use client";

import { useState } from "react";
import { parseNextTopics } from "@/lib/next-topics";

export function MessageDraftCtaInput({ suggestion }: { suggestion?: string }) {
  const [value, setValue] = useState("");
  const topics = parseNextTopics(suggestion).slice(0, 3);
  return <div className="stack">
    {topics.length > 0 && <div>
      <div className="fieldLabel">話題を入れるなら</div>
      <div className="chips">{topics.map((topic) => <button className="chip chipButton" type="button" key={topic} onClick={() => setValue(topic)}>{topic}</button>)}</div>
    </div>}
    <label className="fieldLabel" htmlFor="cta">入れたい内容（任意）</label>
    <input className="searchBox" id="cta" name="cta" value={value} onChange={(event) => setValue(event.target.value)} placeholder="例：この前の大阪出張どうだった？" autoComplete="off" />
  </div>;
}
