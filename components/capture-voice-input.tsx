"use client";

import { useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function CaptureVoiceInput({ name = "value", placeholder }: { name?: string; placeholder: string }) {
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function startRecording() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setUnsupported(true);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("")
        .trim();
      if (transcript) setValue((current) => current ? `${current}${current.endsWith("。") ? "" : "。"}${transcript}` : transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setUnsupported(false);
    setRecording(true);
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="captureVoiceInput">
      <textarea
        className="searchBox captureTextArea"
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        rows={3}
      />
      <button
        className={recording ? "voiceButton recording" : "voiceButton"}
        type="button"
        onClick={recording ? stopRecording : startRecording}
        aria-pressed={recording}
      >
        <span aria-hidden="true">{recording ? "■" : "●"}</span>
        {recording ? "録音を止める" : "押して話す"}
      </button>
      <div className="formHint">
        {recording ? "あなたのメモを聞き取っています。止めると文字になります。" : unsupported ? "この端末では音声入力を利用できません。文字入力はそのまま使えます。" : "音声は自分のメモ入力用です。常時録音はしません。"}
      </div>
    </div>
  );
}
