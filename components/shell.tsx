"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Keyboard, Crown, Info, Settings, Bell, UserRound,
  Mail,
  MessageCircle,
  Palette,
  Code2,
} from "@/components/icons";
import { useApp } from "./context";
import { Modals } from "./modals";
import { Logo } from "./brand-logo";
export { Logo } from "./brand-logo";
export function Shell({ children }: { children: React.ReactNode }) {
  const { config, user, active, setModal } = useApp(),
    path = usePathname();
  return (
    <>
      <div className={`app-shell ${active ? "typing-active" : ""}`}>
        <div className="content-shell">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="Monkeytype Racer home">
              <Logo />
              <span className="brand-name">monkeytype <span className="brand-racer">racer</span></span>
            </Link>
            <nav aria-label="Main navigation">
              <Link
                href="/"
                title="test"
                aria-label="Typing test"
                className={path === "/" ? "current" : ""}
              >
                <Keyboard size={18} />
              </Link>
              <Link
                href="/leaderboards"
                title="leaderboards"
                aria-label="Leaderboards"
              >
                <Crown size={19} />
              </Link>
              <Link href="/about" title="about" aria-label="About">
                <Info size={17} />
              </Link>
              <Link href="/settings" title="settings" aria-label="Settings">
                <Settings size={18} />
              </Link>
            </nav>
            <div className="header-right">
              <button
                type="button"
                title="notifications"
                aria-label="Notifications"
                onClick={() => setModal("notifications")}
              >
                <Bell size={18} />
              </button>
              <Link
                href={user ? "/account" : "/login"}
                aria-label={user ? "Account" : "Sign in"}
                title="account"
              >
                <UserRound size={19} />
                {user && <span>{user.name}</span>}
              </Link>
            </div>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            {path === "/practice" && config.showKeyTips && (
              <div className="key-tips">
                <div>
                  <kbd>tab</kbd> + <kbd>enter</kbd> - restart test
                </div>
                <div>
                  <kbd>esc</kbd> or <kbd>ctrl</kbd> + <kbd>shift</kbd> +{" "}
                  <kbd>p</kbd> - command line
                </div>
              </div>
            )}
            <div className="footer-links">
              <div>
                <a href="mailto:quentinromero@outlook.com"><Mail />support</a>
                <Link href="/about"><Info />about & credits</Link>
                <Link href="/licenses"><Code2 />source & licenses</Link>
                <a href="https://discord.gg/KJ75VN2pM" target="_blank" rel="noreferrer"><MessageCircle />discord</a>
                <Link href="/guides">guides</Link>
                <Link href="/terms">terms</Link>
                <Link href="/security">security</Link>
                <Link href="/privacy">privacy</Link>
              </div>
              <div>
                <button type="button" onClick={() => setModal("theme")}>
                  <Palette />
                  {config.customTheme
                    ? "custom"
                    : config.theme.replaceAll("_", " ")}
                </button>
                <button type="button" onClick={() => setModal("version")}>
                  <Code2 />
                  v0.1.0
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <Modals />
    </>
  );
}
