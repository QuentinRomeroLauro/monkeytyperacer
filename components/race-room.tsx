"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useApp } from "./context";
import { useStored } from "@/lib/store";
import { useRaceRoom } from "./use-race-room";
import { RaceTyping } from "./race-typing";
import { racerName } from "@/lib/racer-name";
import { raceStandings } from "@/lib/race-standings";
import { useRaceEntry } from "./use-race-entry";
import { RaceEnterButton } from "./race-enter-button";
import {
  ArrowRight,
  Check,
  Copy,
  Crown,
  Globe,
  LogOut,
  RotateCw,
  UserPlus,
} from "./icons";
import { Logo } from "./brand-logo";
import { Chart } from "./chart";
import { RaceShareActions } from "./race-share";
export function RaceRoom({ id }: { id: string }) {
  const { room, error, action, edit, offset } = useRaceRoom(id),
    router = useRouter();
  const { user, setActive } = useApp();
  const [name, setName] = useStored("mtr.racer-name", "");
  const [busy, setBusy] = useState(false),
    [localError, setLocalError] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);
  const now = clock + offset,
    me = room?.players.find((p) => p.id === room.me?.id);
  const underway =
    !!room?.startAt &&
    now >= room.startAt &&
    room.phase !== "waiting" &&
    room.phase !== "finished";
  const finished = !!me?.finishedAt || room?.phase === "finished";
  const nextEntry = useRaceEntry({ enabled: finished && !busy, nameOverride: me?.name });
  const finishHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (finished) finishHeading.current?.focus({ preventScroll: true });
  }, [finished]);
  useEffect(() => {
    setActive(!!underway && !finished);
    return () => setActive(false);
  }, [underway, finished, setActive]);
  async function command(body: Record<string, unknown>) {
    setBusy(true);
    setLocalError("");
    try {
      await action(body);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function invite() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/race/${id}`);
      setInviteCopied(true);
      setLocalError("");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      setLocalError(
        "Copy the room link from your browser’s address bar to invite a friend.",
      );
    }
  }
  async function leave(destination = "/") {
    setBusy(true);
    try {
      await action({ action: "leave" });
      router.push(destination);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Unable to leave.");
      setBusy(false);
    }
  }
  if (!room)
    return (
      <div className="race-loading">
        <Globe />
        <p>{error || "connecting to the room…"}</p>
        <Link href="/">back to races</Link>
      </div>
    );
  const host = room.host === me?.id;
  const count = Math.max(0, Math.ceil(((room.startAt ?? now) - now) / 1000));
  const ranking = raceStandings(room.players);
  const laneColors = ["#e9b65f", "#c18ce0", "#79c99e", "#ed8f9a", "#d78f68", "#a5b86c", "#c3a6db"];
  const opponents = room.players.filter(p => p.id !== room.me?.id);
  const lanes = room.players.map(player => ranking.find(p => p.id === player.id)!);
  const myStanding = ranking.find(p => p.id === me?.id);
  const place = myStanding?.place ?? 0;
  const ordinal = `${place}${place === 1 ? "st" : place === 2 ? "nd" : place === 3 ? "rd" : "th"}`;
  const ready = room.players.length >= 2 && room.players.every((p) => p.ready);
  const message = nextEntry.error || localError || error;
  return (
    <div className="race-room">
      <div className="race-room-toolbar">
        <span>
          {room.kind === "private" ? (
            <UserPlus size={16} />
          ) : (
            <Globe size={16} />
          )}{" "}
          {room.kind === "private" ? "friends room" : "public race"}{" "}
          <span className="race-round">/ round {room.round}</span>
        </span>
        <div>
          {(room.phase !== "waiting" || !room.me) && <button onClick={invite} aria-live="polite" title="Copy invite link">
            {inviteCopied ? <Check size={16} /> : <Copy size={16} />} {inviteCopied ? "copied" : "invite link"}
          </button>}
          <button disabled={busy} onClick={() => leave()} title="Leave room">
            <LogOut size={16} /> leave
          </button>
        </div>
      </div>
      {message && (
        <div className="race-error" role="alert">
          {message}{" "}
          {error && <span>Your typing stays here while we reconnect.</span>}
        </div>
      )}
      {!room.me ? (
        <div className="race-join-panel">
          <h1>
            {room.kind === "private"
              ? "you’re invited to race"
              : "join the race"}
          </h1>
          <p>
            {room.players.map((p) => p.name).join(", ") || "Your friends"}{" "}
            {room.players.length === 1 ? "is" : "are"} in the room.
          </p>
          <label htmlFor="join-name">your racer name</label>
          <input
            id="join-name"
            value={name || user?.name || ""}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="choose a name"
            autoComplete="nickname"
          />
          <button
            className="race-primary"
            disabled={
              busy || (room.phase !== "waiting" && room.phase !== "countdown")
            }
            onClick={() => {
              const chosen = racerName(name || user?.name);
              setName(chosen);
              void command({ action: "join", name: chosen });
            }}
          >
            join room <ArrowRight size={18} />
          </button>
          {room.phase !== "waiting" && (
            <p>
              {room.phase === "finished"
                ? "Waiting for the host to open the next round."
                : "A race is in progress. You can join the next round."}
            </p>
          )}
        </div>
      ) : (
        <>
          {room.phase === "waiting" && (
            <section className="race-lobby" aria-label="Race lobby">
              <div className="race-lobby-heading">
                <h1>racers <span>{room.players.length}/5</span></h1>
                <button onClick={invite} aria-live="polite">{inviteCopied ? <Check size={16} /> : <Copy size={16} />} {inviteCopied ? "copied" : "copy invite link"}</button>
              </div>
              <div className="race-lobby-players">
                {room.players.map((p) => (
                  <div key={p.id}>
                    <span>
                      {p.name} {p.id === room.me?.id && <small>(You)</small>}{" "}
                      {p.id === room.host && room.kind === "private" && (
                        <Crown size={14} />
                      )}
                    </span>
                    <span>
                      {room.kind === "public" ? (
                        "in the lobby"
                      ) : p.ready ? (
                        <>
                          <Check size={15} /> ready
                        </>
                      ) : (
                        "not ready"
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="race-lobby-actions">
                {room.kind === "private" ? (
                  <>
                    <button
                      className={me?.ready ? "" : "race-primary"}
                      disabled={busy}
                      onClick={() =>
                        command({ action: "ready", ready: !me?.ready })
                      }
                    >
                      <Check size={18} />
                      {me?.ready ? "not ready" : "i’m ready"}
                    </button>
                    {host && me?.ready && (
                      <button
                        className="race-primary"
                        disabled={busy || !ready}
                        onClick={() => command({ action: "start" })}
                      >
                        start race <ArrowRight size={18} />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button disabled={busy} onClick={() => leave("/practice")}>
                      leave queue & practice
                    </button>
                  </>
                )}
              </div>
              <p className="race-lobby-status" role="status">
                {room.players.length < 2 ? (room.kind === "private" ? "waiting for a friend…" : "finding an opponent…")
                  : room.kind === "private" ? (!ready ? "waiting for everyone to get ready…" : !host ? "waiting for the host…" : "everyone’s ready")
                  : "starting soon…"}
              </p>
            </section>
          )}
          {room.phase !== "waiting" && (
            <>
              <div className="race-progress-list" aria-label="Race progress">
                {lanes.map((p) => (
                  <div
                    className={`race-progress ${p.id === room.me?.id ? "is-you" : ""} ${p.finishedAt ? "has-finished" : ""}`}
                    key={p.id}
                    data-racer-id={p.id}
                    style={{ "--racer-color": p.id === room.me?.id ? "var(--main-color)" : laneColors[opponents.findIndex(player => player.id === p.id) % laneColors.length] } as CSSProperties}
                  >
                    <div>
                      <span>
                        {p.name}
                        {p.id === room.me?.id ? " (You)" : ""}
                      </span>
                      <small>
                        {p.finishedAt
                          ? `finished · ${Math.round(p.wpm)} wpm`
                          : p.left
                            ? "left race"
                            : now - p.seenAt > 15000
                              ? "reconnecting"
                              : room.phase === "finished"
                                ? "unfinished"
                                : ""}
                      </small>
                      <span className="race-position" aria-label={`Place ${p.place}${p.tied ? ", tied" : ""}`}>{p.place}</span>
                    </div>
                    <div className="race-track" role="progressbar" aria-label={`${p.name} race progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p.progress * 100)}>
                      <div className="race-car-path">
                        <div className="race-car" style={{ left: `${Math.max(0, Math.min(1, p.progress || 0)) * 100}%` }}>
                          <Logo width={52} height={34} viewBox="0 20 88 56" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="race-quote-stage">
                  <div className="race-status" aria-live="polite">
                    {finished ? <cite className="race-quote-title">{room.source}</cite> : <>
                    {!underway ? (
                      <>
                        <span className="race-countdown">{count}</span> get
                        ready
                      </>
                    ) : (
                      <>
                        <span>go</span>{" "}
                        <small>
                          {Math.max(
                            0,
                            Math.ceil((room.deadline! - now) / 1000),
                          )}
                          s remaining
                        </small>
                      </>
                    )}
                    </>}
                  </div>
                  <RaceTyping
                    key={`${room.id}:${room.round}`}
                    quote={room.quote}
                    initial={room.me.typed}
                    enabled={!finished && underway && now < room.deadline!}
                    finished={finished}
                    replayId={`${room.id}:${room.round}`}
                    onEdit={edit}
                  />
                  {!finished && <div className="quote-source">{room.source}</div>}
              </div>
              {finished && (
                <div className="race-results" aria-label="Race results">
                  <div className="race-launch-primary race-next-action"><RaceEnterButton entry={nextEntry} label="Next race" /></div>
                  <div className={`race-finish-heading ${me?.finishedAt ? "is-complete" : ""}`}>
                    <div className="race-finish-title">
                      <div className="race-place-badge" aria-hidden="true">
                        {me?.finishedAt && <Crown size={22} />}<strong>{place}<small>{ordinal.slice(String(place).length)}</small></strong>
                      </div>
                      <div>
                        <h1 ref={finishHeading} tabIndex={-1}>
                          {myStanding?.tied ? `you tied for ${ordinal}` : me?.finishedAt ? `you finished ${ordinal}!` : `you placed ${ordinal}`}
                        </h1>
                        <p>{me?.finishedAt ? `out of ${room.players.length} racers` : "quote unfinished · give it another go"}</p>
                      </div>
                    </div>
                    <dl className="race-finish-stats">
                      <div className="race-speed-stat"><dt>{me?.finishedAt ? "wpm" : "wpm at finish"}</dt><dd>{Math.round(me?.wpm ?? 0)}</dd></div>
                      <div><dt>accuracy</dt><dd>{Math.round(me?.accuracy ?? 100)}<small>%</small></dd></div>
                      <div><dt>{me?.finishedAt ? "time" : "completed"}</dt><dd>{me?.finishedAt ? ((me.finishedAt - room.startAt!) / 1000).toFixed(1) : Math.round((me?.progress ?? 0) * 100)}<small>{me?.finishedAt ? "s" : "%"}</small></dd></div>
                    </dl>
                  </div>
                  <div className="race-result-buttons">
                    {room.kind === "private" && host && (
                      <button
                        disabled={busy || room.phase !== "finished"}
                        onClick={() =>
                          command({ action: "rematch", round: room.round })
                        }
                      >
                        <RotateCw size={18} /> rematch
                      </button>
                    )}
                    {me?.finishedAt && <RaceShareActions key={`${room.id}:${room.round}`} result={{ wpm: me.wpm, accuracy: me.accuracy, place, racers: room.players.length }} />}
                    <button onClick={invite} aria-live="polite">
                      {inviteCopied ? <Check size={18} /> : <UserPlus size={18} />} {inviteCopied ? "copied" : "invite a friend"}
                    </button>
                  </div>
                  <div className="race-standings-wrap">
                    <table className="race-standings">
                      <caption>this race’s standings</caption>
                      <thead>
                        <tr>
                          <th>place</th>
                          <th>racer</th>
                          <th>wpm</th>
                          <th>accuracy</th>
                          <th>finish time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((p) => (
                          <tr
                            key={p.id}
                            className={p.id === room.me?.id ? "is-you" : ""}
                          >
                            <td title={p.tied ? `Tied for place ${p.place}` : undefined}>{p.place}</td>
                            <td>
                              {p.name}
                              {p.id === room.me?.id ? " (You)" : ""}
                            </td>
                            <td>{p.finishedAt ? Math.round(p.wpm) : "—"}</td>
                            <td>
                              {p.finishedAt
                                ? `${Math.round(p.accuracy)}%`
                                : "—"}
                            </td>
                            <td>
                              {p.finishedAt
                                ? `${((p.finishedAt - room.startAt!) / 1000).toFixed(2)}s`
                                : p.left
                                  ? "left race"
                                  : room.phase === "finished"
                                    ? "unfinished"
                                    : "still racing"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {room.phase !== "finished" && (
                    <p className="race-results-note">
                      Others can still finish ·{" "}
                      {Math.max(0, Math.ceil((room.deadline! - now) / 1000))}s
                      remaining
                    </p>
                  )}
                  <section className="race-analysis" aria-labelledby="race-analysis-heading">
                    <h2 id="race-analysis-heading">your typing analysis</h2>
                    <Chart samples={room.me.samples} />
                    <p>
                      {me?.attempts ?? 0} keystrokes · {me?.errors ?? 0}{" "}
                      typing errors · {room.source}
                    </p>
                    <Link href="/practice">
                      practice another quote <ArrowRight size={14} />
                    </Link>
                  </section>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
