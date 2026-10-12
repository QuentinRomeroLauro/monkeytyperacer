"use client";
import posthog from "posthog-js";
let ready = false;
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const analyticsConfigured = !!key;
export function analyticsPath(path: string) {
  return path.startsWith("/race/") ? "/race/:id" : path.split(/[?#]/)[0];
}
export function scrubAnalyticsProperties(properties: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(properties).flatMap(([name, value]) => {
    if (/url|pathname|referrer|email|password|typed|quote_text|racer_name/i.test(name)) return [];
    if (value && typeof value === "object" && !Array.isArray(value)) return [[name, scrubAnalyticsProperties(value as Record<string, unknown>)]];
    return [[name, value]];
  }));
}
export function analyticsDisabled() {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem("mtr.analytics-disabled") === "true" || navigator.doNotTrack === "1"; } catch { return true; }
}
export function initAnalytics() {
  if (ready || !key || typeof window === "undefined" || analyticsDisabled()) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", persistence: "localStorage",
    autocapture: false, capture_pageview: false, capture_pageleave: false,
    disable_session_recording: true, capture_exceptions: false,
    advanced_disable_flags: true, disable_surveys: true,
    respect_dnt: true, ip: false,
    before_send: event => {
      if (!event) return null;
      event.properties = scrubAnalyticsProperties(event.properties);
      event.properties.$current_url = location.origin + analyticsPath(location.pathname);
      event.properties.$pathname = analyticsPath(location.pathname);
      return event;
    },
  });
  ready = true;
}
export function track(event: string, properties: Record<string, string | number | boolean | null> = {}) {
  try {
    initAnalytics();
    if (!ready || analyticsDisabled()) return;
    posthog.capture(event, { ...properties, page: analyticsPath(location.pathname), product: "monkeytype_racer", environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV, schema_version: 1 });
  } catch { /* Analytics must never interrupt typing or navigation. */ }
}
export function trackOnce(event: string, id: string, properties: Record<string, string | number | boolean | null> = {}) {
  if (!key || analyticsDisabled()) return;
  try {
    const marker = `mtr.analytics:${event}:${id}`;
    if (sessionStorage.getItem(marker)) return;
    track(event, properties);
    sessionStorage.setItem(marker, "1");
  } catch { /* Storage may be disabled. */ }
}
export function identifyAnalytics(id: string | null) {
  try {
    initAnalytics();
    if (!ready || analyticsDisabled()) return;
    if (id) posthog.identify(id);
    else if (posthog.get_property("$user_id")) posthog.reset();
  } catch { /* Optional telemetry. */ }
}
export function setAnalyticsDisabled(disabled: boolean) {
  try {
    localStorage.setItem("mtr.analytics-disabled", String(disabled));
    if (disabled && ready) { posthog.reset(); posthog.opt_out_capturing(); }
    else if (!disabled) { initAnalytics(); if (ready) posthog.opt_in_capturing({ captureEventName: false }); }
  } catch { /* Browser storage can be unavailable. */ }
}
