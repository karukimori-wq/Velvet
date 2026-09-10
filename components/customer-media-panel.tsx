"use client";

import { useMemo, useState } from "react";

type MediaItem = {
  id: string;
  key: string;
  occurredAt: string;
  title: string;
};

export function CustomerMediaPanel({ customerId, initialItems }: { customerId: string; initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const accept = useMemo(() => "image/jpeg,image/png,image/webp,image/gif", []);

  async function upload(formData: FormData) {
    setBusy(true);
    setMessage("");
    formData.set("customerId", customerId);
    try {
      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.status !== "success" || !body?.media?.key) {
        setMessage(body?.error?.message ?? "画像を保存できませんでした。");
        return;
      }
      setItems(current => [{ id: body.media.timelineId, key: body.media.key, occurredAt: new Date().toISOString(), title: "画像を保存" }, ...current]);
      setMessage("画像を保存しました。");
    } catch {
      setMessage("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setBusy(false);
    }
  }

  return <section className="card stack">
    <div className="timelineTitle">画像</div>
    <form action={upload} className="compactForm">
      <input name="file" type="file" accept={accept} required disabled={busy} />
      <button className="secondaryButton" type="submit" disabled={busy}>{busy ? "保存中…" : "画像を追加"}</button>
    </form>
    {message && <div className="formHint" aria-live="polite">{message}</div>}
    {items.length > 0 ? <div className="mediaGrid">{items.map(item => <a className="mediaThumb" key={item.id} href={`/api/media/object?key=${encodeURIComponent(item.key)}&customerId=${encodeURIComponent(customerId)}`} target="_blank" rel="noreferrer"><img src={`/api/media/object?key=${encodeURIComponent(item.key)}&customerId=${encodeURIComponent(customerId)}`} alt={`${item.occurredAt.slice(0,10)}に保存した画像`} loading="lazy" /></a>)}</div> : <div className="formHint">保存した画像はまだありません。</div>}
  </section>;
}
