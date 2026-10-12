"use client";
import { useCallback, useSyncExternalStore } from "react";
const cache = new Map<string, { raw: string | null; value: unknown }>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
export function useStored<T>(
  key: string,
  initial: T,
  migrate?: (saved: T) => Partial<T>,
): [T, (value: T | ((previous: T) => T)) => void] {
  const read = useCallback((): T => {
    if (typeof window === "undefined") return initial;
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return initial;
    }
    const cached = cache.get(key);
    if (cached && cached.raw === raw) return cached.value as T;
    let value = initial;
    try {
      if (raw) value = JSON.parse(raw);
    } catch {
      /* Ignore malformed local data. */
    }
    if (migrate) value = { ...value, ...migrate(value) };
    if (value && typeof value === "object" && !Array.isArray(value))
      value = { ...initial, ...value };
    cache.set(key, { raw, value });
    return value;
  }, [key, initial, migrate]);
  const value = useSyncExternalStore(subscribe, read, () => initial);
  const set = useCallback(
    (update: T | ((previous: T) => T)) => {
      const next =
        typeof update === "function"
          ? (update as (previous: T) => T)(read())
          : update;
      const raw = JSON.stringify(next);
      try {
        localStorage.setItem(key, raw);
      } catch {
        /* Private mode or full storage. Keep this session usable. */
      }
      cache.set(key, { raw, value: next });
      emit();
    },
    [key, read],
  );
  return [value, set];
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
