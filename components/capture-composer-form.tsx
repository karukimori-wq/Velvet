"use client";

import { useActionState } from "react";
import { CaptureChatInput } from "@/components/capture-chat-input";
import type { RememberGroup } from "@/lib/remember-fields";
import type { CaptureOrganizeState } from "@/app/capture/organize/actions";

type CaptureComposerAction = (state: CaptureOrganizeState, formData: FormData) => Promise<CaptureOrganizeState>;

export function CaptureComposerForm({
  action,
  groups,
  knownTags,
  phase,
  voiceAllowed,
  placeholder,
}: {
  action: CaptureComposerAction;
  groups: RememberGroup[];
  knownTags: string[];
  phase: "first" | "repeat";
  voiceAllowed: boolean;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as CaptureOrganizeState);
  return <form action={formAction} className="stack captureForm">
    <CaptureChatInput groups={groups} knownTags={knownTags} phase={phase} voiceAllowed={voiceAllowed} placeholder={placeholder}/>
    {state.error && <div className="captureInlineError" role="alert" aria-live="polite">
      <strong>{state.error === "empty" ? "覚えておく内容を入力してください" : "まだ保存できていません"}</strong>
      <span>{state.error === "empty" ? "短い一言やスタンプだけでも大丈夫です。" : "入力した内容はこの画面に残しています。通信を確認して、もう一度押してください。"}</span>
    </div>}
    <button className="primaryButton" type="submit" disabled={pending} aria-disabled={pending}>{pending ? "保存しています…" : "整理して確認"}</button>
  </form>;
}
