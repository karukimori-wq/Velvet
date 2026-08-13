"use client";

import { useState } from "react";

export function MessageDraftCtaInput({ suggestion }: { suggestion?: string }) {
  const [value, setValue] = useState("");
  return <div className="stack">
    {suggestion && <div className="card noticeCard">
      <div className="timelineTitle">次回話題候補</div>
      <div className="timelineBody">{suggestion}</div>
      <button className="secondaryButton compactButton" type="button" onClick={() => setValue(suggestion)}>使う</button>
    </div>}
    <label className="fieldLabel" htmlFor="cta">伝えたい行動（任意）</label>
    <input className="searchBox" id="cta" name="cta" value={value} onChange={(event) => setValue(event.target.value)} placeholder="例：また時間ある時に連絡して" autoComplete="off" />
  </div>;
}
