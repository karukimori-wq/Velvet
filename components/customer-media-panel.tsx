"use client";

import { useMemo, useState } from "react";

type MediaItem = {
  id: string;
  key: string;
  occurredAt: string;
  title: string;
};

function mediaUrl(customerId: string, key: string) {
  return `/api/media/object?key=${encodeURIComponent(key)}&customerId=${encodeURIComponent(customerId)}`;
}

export function CustomerMediaPanel({ customerId, initialItems }: { customerId: string; initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
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

  async function remove(item: MediaItem) {
    if (!window.confirm("この画像を削除しますか？")) return;
    setDeletingKey(item.key);
    setMessage("");
    try {
      const response = await fetch(mediaUrl(customerId, item.key), { method: "DELETE" });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.status !== "success" || body?.deleted !== true) {
        setMessage(body?.error?.message ?? "画像を削除できませんでした。");
        return;
      }
      setItems(current => current.filter(currentItem => currentItem.key !== item.key));
      setMessage("画像を削除しました。");
    } catch {
      setMessage("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setDeletingKey(null);
    }
  }

  return <section className="card stack">
    <div className="timelineTitle">画像</div>
    <form action={upload} className="compactForm">
      <input name="file" type="file" accept={accept} required disabled={busy || deletingKey !== null} />
      <button className="secondaryButton" type="submit" disabled={busy || deletingKey !== null}>{busy ? "保存中…" : "画像を追加"}</button>
    </form>
    {message && <div className="formHint" aria-live="polite">{message}</div>}
    {items.length > 0 ? <div className="mediaGrid">{items.map(item => {
      const url = mediaUrl(customerId, item.key);
      const deleting = deletingKey === item.key;
      return <div className="mediaTile" key={item.id}>
        <a className="mediaThumb" href={url} target="_blank" rel="noreferrer"><img src={url} alt={`${item.occurredAt.slice(0, 10)}に保存した画像`} loading="lazy" /></a>
        <button className="mediaDeleteButton" type="button" disabled={deletingKey !== null} onClick={() => remove(item)}>{deleting ? "削除中…" : "削除"}</button>
      </div>;
    })}</div> : <div className="formHint">保存した画像はまだありません。</div>}
  </section>;
}
