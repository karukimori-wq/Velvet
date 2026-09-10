"use client";

import Link from "next/link";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Mode = "signup" | "signin";

function validVelvetPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export default function AuthPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const [mode, setMode] = useState<Mode>("signup");
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isSignedIn) router.replace("/");
  }, [isSignedIn, router]);

  const busy = signInStatus === "fetching" || signUpStatus === "fetching";

  async function finishSignIn() {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setMessage("追加の本人確認が必要です。もう一度お試しください。");
          return;
        }
        const url = decorateUrl("/");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
  }

  async function finishSignUp() {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setMessage("追加の本人確認が必要です。もう一度お試しください。");
          return;
        }
        const url = decorateUrl("/");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
  }

  async function handleSignIn(formData: FormData) {
    setMessage("");
    const emailAddress = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!emailAddress || !password) {
      setMessage("メールアドレスとパスワードを入力してください。");
      return;
    }

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setMessage("メールアドレスまたはパスワードを確認してください。");
      return;
    }
    if (signIn.status === "complete") await finishSignIn();
    else setMessage("追加の本人確認が必要です。もう一度お試しください。");
  }

  async function handleSignUp(formData: FormData) {
    setMessage("");
    const emailAddress = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!emailAddress) {
      setMessage("メールアドレスを入力してください。");
      return;
    }
    if (!validVelvetPassword(password)) {
      setMessage("パスワードは8文字以上で、英字と数字を含めてください。");
      return;
    }

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setMessage("登録内容を確認してください。すでに登録済みの場合はログインしてください。");
      return;
    }
    const verification = await signUp.verifications.sendEmailCode();
    if (verification.error) {
      setMessage("確認コードを送信できませんでした。時間をおいてもう一度お試しください。");
      return;
    }
    setVerificationSent(true);
  }

  async function handleVerify(formData: FormData) {
    setMessage("");
    const code = String(formData.get("code") ?? "").trim();
    if (!code) {
      setMessage("確認コードを入力してください。");
      return;
    }
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setMessage("確認コードが正しいか確認してください。");
      return;
    }
    if (signUp.status === "complete") await finishSignUp();
    else setMessage("登録を完了できませんでした。もう一度お試しください。");
  }

  if (isSignedIn) return null;

  return (
    <main className="shell">
      <header className="header"><div className="brand">Velvet</div></header>
      <section className="hero">
        <h1>{verificationSent ? "メールを確認" : mode === "signup" ? "無料で登録" : "ログイン"}</h1>
        <p>{verificationSent ? "届いた確認コードを入力してください。" : "お客様との大切な記録を、ひとつの場所に。"}</p>
      </section>

      <section className="card stack">
        {verificationSent ? (
          <form action={handleVerify} className="stack">
            <label className="fieldLabel" htmlFor="code">確認コード</label>
            <input className="searchBox" id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required />
            {message && <div className="formError" role="alert">{message}</div>}
            <button className="primaryButton" type="submit" disabled={busy}>{busy ? "確認中…" : "登録を完了"}</button>
            <button className="secondaryButton" type="button" disabled={busy} onClick={() => void signUp.verifications.sendEmailCode()}>確認コードを再送</button>
          </form>
        ) : mode === "signup" ? (
          <form action={handleSignUp} className="stack">
            <label className="fieldLabel" htmlFor="signup-email">メールアドレス</label>
            <input className="searchBox" id="signup-email" name="email" type="email" autoComplete="email" required />
            <label className="fieldLabel" htmlFor="signup-password">パスワード</label>
            <input className="searchBox" id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <div className="formHint">8文字以上・英字と数字を含む</div>
            {message && <div className="formError" role="alert">{message}</div>}
            <button className="primaryButton" type="submit" disabled={busy}>{busy ? "登録中…" : "無料で登録"}</button>
            <button className="secondaryButton" type="button" onClick={() => { setMode("signin"); setMessage(""); }}>登録済みの方はこちら（ログイン）</button>
            <div id="clerk-captcha" />
          </form>
        ) : (
          <form action={handleSignIn} className="stack">
            <label className="fieldLabel" htmlFor="signin-email">メールアドレス</label>
            <input className="searchBox" id="signin-email" name="email" type="email" autoComplete="email" required />
            <label className="fieldLabel" htmlFor="signin-password">パスワード</label>
            <input className="searchBox" id="signin-password" name="password" type="password" autoComplete="current-password" required />
            {message && <div className="formError" role="alert">{message}</div>}
            <button className="primaryButton" type="submit" disabled={busy}>{busy ? "ログイン中…" : "ログイン"}</button>
            <button className="secondaryButton" type="button" onClick={() => { setMode("signup"); setMessage(""); }}>初めての方はこちら（無料登録）</button>
          </form>
        )}
      </section>
      <p className="formHint" style={{ marginTop: 16 }}>登録・ログインを続けることで、Velvetの利用に必要な認証処理に同意したものとみなされます。</p>
      <Link className="subtle" href="/api/health">稼働状況</Link>
    </main>
  );
}
