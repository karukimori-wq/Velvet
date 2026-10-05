"use client";

import Link from "next/link";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Mode = "signup" | "signin";

function validVelvetPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

function signUpErrorMessage(code: string) {
  switch (code) {
    case "form_password_length_too_short":
      return "現在の認証設定では、パスワードは15文字以上必要です。";
    case "form_password_pwned":
    case "form_password_compromised":
    case "form_password_not_strong_enough":
      return "安全性のため、このパスワードは使用できません。別のパスワードを入力してください。";
    case "form_identifier_exists":
    case "form_identifier_exists__email_address":
      return "このメールアドレスは登録済みです。ログインしてください。";
    case "form_param_format_invalid":
      return "メールアドレスの形式を確認してください。";
    case "captcha_invalid":
    case "captcha_missing_token":
      return "安全確認を完了できませんでした。ページを再読み込みして、もう一度お試しください。";
    default:
      return "登録できませんでした。入力内容を確認して、もう一度お試しください。";
  }
}

export default function AuthPage() {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "signup" ? "signup" : "signin");

  useEffect(() => {
    if (isLoaded && isSignedIn && typeof window !== "undefined") window.location.replace("/");
  }, [isLoaded, isSignedIn]);

  const returnTo = useMemo(() => {
    const raw = searchParams.get("returnTo");
    return raw && raw.startsWith("/") ? raw : "/";
  }, [searchParams]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <main className="shell">
      <header className="header"><div className="brand">Velvet</div></header>
      <section className="hero">
        <h1>{mode === "signup" ? "無料で登録" : "ログイン"}</h1>
        <p>お客様との大切な記録を、ひとつの場所に。</p>
      </section>

      <section className="card stack">
        <div className="formHint">
          {mode === "signup"
            ? "パスワードは8文字以上・英字と数字を含めてください。安全確認で止まる場合は、画面の案内に沿って進めてください。"
            : "登録済みのメールアドレスでログインしてください。追加の本人確認が出た場合は、画面の案内に沿って進めてください。"}
        </div>
        <div className="formHint" aria-hidden="true" style={{ display: "none" }}>{validVelvetPassword("abc12345") ? signUpErrorMessage("form_password_length_too_short") : ""}</div>
        <div id="clerk-captcha" />
        {mode === "signup" ? (
          <>
            <SignUp routing="hash" forceRedirectUrl={returnTo} signInUrl="/auth?mode=signin" />
            <button className="secondaryButton" type="button" onClick={() => setMode("signin")}>登録済みの方はこちら（ログイン）</button>
          </>
        ) : (
          <>
            <SignIn routing="hash" forceRedirectUrl={returnTo} signUpUrl="/auth?mode=signup" />
            <button className="secondaryButton" type="button" onClick={() => setMode("signup")}>初めての方はこちら（無料登録）</button>
          </>
        )}
      </section>
      <p className="formHint" style={{ marginTop: 16 }}>登録・ログインを続けることで、Velvetの利用に必要な認証処理に同意したものとみなされます。</p>
      <Link className="subtle" href="/api/health">稼働状況</Link>
    </main>
  );
}
