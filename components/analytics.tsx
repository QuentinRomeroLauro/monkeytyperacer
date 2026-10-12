"use client";
import { useEffect, useSyncExternalStore, useRef } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "./context";
import { analyticsConfigured, analyticsDisabled, identifyAnalytics, setAnalyticsDisabled, track } from "@/lib/analytics";
export function Analytics() {
  const path = usePathname();
  const previous = useRef<string | null>(null);
  const { user } = useApp();
  useEffect(() => { if (previous.current !== path) { previous.current = path; track("$pageview"); } }, [path]);
  useEffect(() => { if (user) identifyAnalytics(user.id); }, [user]);
  useEffect(() => {
    const error = () => track("app_error", { category: "unhandled_client_error" });
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", error);
    return () => { window.removeEventListener("error", error); window.removeEventListener("unhandledrejection", error); };
  }, []);
  return null;
}
const subscribePreference = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener("analytics-preference", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("analytics-preference", listener); };
};
export function AnalyticsPreference() {
  const disabled = useSyncExternalStore(subscribePreference, analyticsDisabled, () => true);
  if (!analyticsConfigured) return null;
  return <p><button className="primary-button" onClick={() => { setAnalyticsDisabled(!disabled); window.dispatchEvent(new Event("analytics-preference")); }}>{disabled ? "Enable product analytics" : "Disable product analytics"}</button></p>;
}
