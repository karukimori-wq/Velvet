"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

type AnalyticsProvider = "disabled" | "posthog" | "clarity";

const provider = (process.env.NEXT_PUBLIC_VELVET_ANALYTICS_PROVIDER ?? "disabled")
  .trim()
  .toLowerCase() as AnalyticsProvider;

function screenFromPathname(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/people") return "people_list";
  if (pathname === "/people/new" || pathname === "/add") return "customer_create";
  if (pathname.startsWith("/people/") && pathname.endsWith("/message")) return "message_draft";
  if (pathname.startsWith("/people/") && pathname.endsWith("/gift")) return "gift_record";
  if (pathname.startsWith("/people/") && pathname.endsWith("/edit")) return "customer_edit";
  if (pathname.startsWith("/people/") && pathname.includes("/next-actions")) return "next_actions";
  if (pathname.startsWith("/people/") && pathname.includes("/history/")) return "history_detail";
  if (pathname.startsWith("/people/")) return "customer_detail";
  if (pathname === "/capture") return "capture";
  if (pathname.startsWith("/capture/organize")) return "capture_organize";
  if (pathname === "/search") return "recall_search";
  if (pathname === "/schedule") return "schedule";
  if (pathname === "/plans") return "plans";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname === "/import") return "import";
  if (pathname === "/self-investment") return "self_investment";
  if (pathname.startsWith("/relationships")) return "relationships";
  if (pathname.startsWith("/remember")) return "remember";
  return "other";
}

function sendPostHogPageView(screen: string) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://app.posthog.com";
  if (!key) return;

  const payload = JSON.stringify({
    api_key: key,
    event: "$pageview",
    distinct_id: "anonymous",
    properties: {
      app: "velvet",
      screen,
      privacy: "screen_only",
    },
  });

  const endpoint = `${host.replace(/\/$/, "")}/capture/`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

function loadClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId || document.getElementById("velvet-clarity-script")) return;

  const script = document.createElement("script");
  script.id = "velvet-clarity-script";
  script.async = true;
  script.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${projectId}");`;
  document.head.appendChild(script);
}

export function PrivacySafeAnalytics() {
  const pathname = usePathname();
  const lastScreenRef = useRef<string>("");
  const screen = useMemo(() => screenFromPathname(pathname), [pathname]);

  useEffect(() => {
    if (provider === "clarity") loadClarity();
  }, []);

  useEffect(() => {
    if (provider === "disabled" || lastScreenRef.current === screen) return;
    lastScreenRef.current = screen;
    if (provider === "posthog") sendPostHogPageView(screen);
    if (provider === "clarity" && "clarity" in window) {
      (window as Window & { clarity?: (...args: string[]) => void }).clarity?.("set", "screen", screen);
    }
  }, [screen]);

  return null;
}
