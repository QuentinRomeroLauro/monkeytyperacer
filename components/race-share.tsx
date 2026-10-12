"use client";
import { useRef, useState } from "react";
import { Logo } from "./shell";
import { Copy, Download, Upload, X } from "./icons";
import { raceCard, resultText, type RaceShare } from "@/lib/share-card";
import { StartActivity } from "./start-activity";
export function RaceShareActions({ result }: { result: RaceShare }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function perform(action: "copy" | "download" | "share") {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (action === "copy") {
        await navigator.clipboard.writeText(resultText(result));
        setMessage("Result copied. Ready to send.");
      } else if (action === "share") {
        if (navigator.share)
          await navigator.share({
            title: "My Monkeytype Racer result",
            text: resultText(result),
          });
        else {
          await navigator.clipboard.writeText(resultText(result));
          setMessage("Result copied. Paste it into your favorite chat.");
        }
      } else {
        const blob = await raceCard(result),
          url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monkeytype-racer-${Math.round(result.wpm)}wpm.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setMessage("Card downloaded.");
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setMessage(
          action === "copy" || action === "share"
            ? "Copy or sharing is unavailable. Select the result text below, or download the card."
            : "Could not export the card. Please try again.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        onClick={() => {
          setMessage("");
          dialog.current?.showModal();
        }}
      >
        <Upload size={18} /> share result
      </button>
      <dialog
        ref={dialog}
        className="share-dialog"
        aria-label="Share your race result"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="share-dialog-inner">
          <div className="share-dialog-heading">
            <h2>One good run. Worth sharing.</h2>
            <button
              autoFocus
              onClick={() => dialog.current?.close()}
              aria-label="Close share result"
            >
              <X size={20} />
            </button>
          </div>
          <div className="race-share-card">
            <div className="share-brand">
              <Logo />
              <span>
                monkeytype <span>racer</span>
              </span>
            </div>
            <p className="share-card-eyebrow">
              quote race / finished {result.place} of {result.racers}
            </p>
            <div className="share-card-stats">
              <div>
                <strong>{Math.round(result.wpm)}</strong>
                <span>words per minute</span>
              </div>
              <div>
                <strong>
                  {Math.round(result.accuracy)}
                  <small>%</small>
                </strong>
                <span>accuracy</span>
              </div>
            </div>
            <div className="share-card-footer">
              <span>Your turn. Race me?</span>
              <small>monkeytyperacer.com</small>
            </div>
          </div>
          <div className="share-controls">
            <button disabled={busy} onClick={() => perform("download")}>
              <Download size={16} /> download card
            </button>
            <button disabled={busy} onClick={() => perform("copy")}>
              <Copy size={16} /> copy result
            </button>
            <button disabled={busy} onClick={() => perform("share")}>
              <Upload size={16} /> share
            </button>
          </div>
          <p className="share-status" role="status">
            {message}
          </p>
          <details className="share-text">
            <summary>result text</summary>
            <p>{resultText(result)}</p>
          </details>
          <div className="share-challenge">
            <div>
              <h3>Settle it in a fresh room.</h3>
              <p>Create a room, then copy its invite link for your friend.</p>
            </div>
            <StartActivity mode="friends">challenge a friend</StartActivity>
          </div>
        </div>
      </dialog>
    </>
  );
}
