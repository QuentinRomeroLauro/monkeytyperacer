"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import {
  defaults,
  migrateConfig,
  EMPTY_RESULTS,
  type Config,
  type User,
  type TestResult,
} from "@/lib/config";
import { themes } from "@/lib/themes";
import { api, useStored } from "@/lib/store";
import { X, Check, AlertTriangle } from "@/components/icons";
export type ModalName =
  | "command"
  | "theme"
  | "language"
  | "custom"
  | "time"
  | "words"
  | "help"
  | "notifications"
  | "version"
  | null;
type AppContext = {
  config: Config;
  setConfig: (update: Partial<Config>) => void;
  results: TestResult[];
  saveResult: (result: TestResult) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  modal: ModalName;
  setModal: (modal: ModalName) => void;
  notify: (text: string, error?: boolean) => void;
  active: boolean;
  setActive: (active: boolean) => void;
};
const Context = createContext<AppContext | null>(null);
export const useApp = () => {
  const value = useContext(Context);
  if (!value) throw new Error("App context missing");
  return value;
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [config, storeConfig] = useStored("mtr.config", defaults, migrateConfig),
    [results, storeResults] = useStored("mtr.results", EMPTY_RESULTS);
  const [user, setUser] = useState<User | null>(null),
    [modal, setModal] = useState<ModalName>(null),
    [active, setActive] = useState(false);
  const [notices, setNotices] = useState<
    { id: number; text: string; error: boolean }[]
  >([]);
  const notify = useCallback((text: string, error = false) => {
    const id = Date.now();
    setNotices((old) => [...old, { id, text, error }]);
    setTimeout(() => setNotices((old) => old.filter((n) => n.id !== id)), 5000);
  }, []);
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setConfig = useCallback(
    (update: Partial<Config>) => storeConfig((old) => ({ ...old, ...update })),
    [storeConfig],
  );
  useEffect(() => {
    let cancelled = false;
    api<{ user: (User & { settings?: Partial<Config> }) | null }>("auth/me")
      .then(({ user }) => {
        if (cancelled) return;
        setUser(user);
        if (user?.settings && Object.keys(user.settings).length)
          storeConfig((old) => ({ ...old, ...migrateConfig(user.settings!), mode: old.mode }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [storeConfig]);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<{ results: TestResult[] }>("results")
      .then(({ results: remote }) => {
        if (cancelled) return;
        storeResults((local) =>
          Array.from(
            new Map([...local, ...remote].map((r) => [r.id, r])).values(),
          )
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 1000),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, storeResults]);
  useEffect(() => {
    if (!user) return;
    cloudTimer.current = setTimeout(() => {
      api("settings", "PUT", config).catch(() => {});
    }, 800);
    return () => {
      if (cloudTimer.current) clearTimeout(cloudTimer.current);
    };
  }, [config, user]);
  useEffect(() => {
    const theme = themes[config.theme] ?? themes.typeracer_dark;
    const colors = {
      ...theme,
      ...(config.customTheme ? { ...config.customColors, caret: config.customColors.main } : {}),
    };
    document.documentElement.style.setProperty("--brand-color", !config.customTheme && config.theme === "typeracer_dark" ? "#005894" : colors.main);
    document.documentElement.style.setProperty("--brand-text-color", !config.customTheme && config.theme === "typeracer_dark" ? "#ffffff" : colors.bg);
    const map: Record<string, string> = {
      bg: "bg",
      main: "main",
      sub: "sub",
      subAlt: "sub-alt",
      text: "text",
      caret: "caret",
      error: "error",
      errorExtra: "error-extra",
    };
    Object.entries(map).forEach(([key, name]) =>
      document.documentElement.style.setProperty(
        `--${name}-color`,
        colors[key as keyof typeof colors] as string,
      ),
    );
    document.documentElement.style.setProperty(
      "--typing-font",
      `"${config.fontFamily}", monospace`,
    );
    document.documentElement.style.setProperty(
      "--font-size",
      `${config.fontSize}px`,
    );
  }, [
    config.theme,
    config.customTheme,
    config.customColors,
    config.fontFamily,
    config.fontSize,
  ]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A native result dialog owns shortcuts, even if an async action moved focus.
      if (document.querySelector("dialog.share-dialog[open]")) return;
      // Let an open native popover consume Escape before global shortcuts.
      if (e.key === "Escape" && document.querySelector(":popover-open")) return;
      if (
        e.key === "Escape" ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p")
      ) {
        e.preventDefault();
        setModal((old) => (old ? null : "command"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const saveResult = useCallback(
    (result: TestResult) => {
      storeResults((old) =>
        old.some((r) => r.id === result.id)
          ? old
          : [result, ...old].slice(0, 1000),
      );
      if (user)
        api("results", "POST", result).catch((error) =>
          notify(`Saved on this device. ${error.message}`, true),
        );
    },
    [storeResults, user, notify],
  );
  const value = useMemo(
    () => ({
      config,
      setConfig,
      results,
      saveResult,
      user,
      setUser,
      modal,
      setModal,
      notify,
      active,
      setActive,
    }),
    [config, setConfig, results, saveResult, user, modal, notify, active],
  );
  return (
    <Context.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {notices.map((n) => (
          <div key={n.id} className={`toast ${n.error ? "error" : ""}`}>
            {n.error ? <AlertTriangle size={18} /> : <Check size={18} />}
            <span>{n.text}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() =>
                setNotices((old) => old.filter((x) => x.id !== n.id))
              }
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}
