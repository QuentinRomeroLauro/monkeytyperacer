"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
export function WpmCalculator() {
  const [characters, setCharacters] = useState("300");
  const [seconds, setSeconds] = useState("60");
  const [tracked, setTracked] = useState(false);
  const count = Number(characters), duration = Number(seconds);
  const valid = characters.trim() !== "" && seconds.trim() !== "" && Number.isSafeInteger(count) && count >= 0 && Number.isFinite(duration) && duration > 0 && Number.isFinite(count * 12 / duration);
  function recordUse() {
    if (!tracked) { track("wpm_calculator_used"); setTracked(true); }
  }
  return (
    <div className="guide-tool">
      <p className="editorial-eyebrow">try the formula</p>
      <div className="calculator-fields">
        <label>Eligible characters<input type="number" min="0" step="1" value={characters} onChange={e => { setCharacters(e.target.value); recordUse(); }} /></label>
        <label>Elapsed seconds<input type="number" min="0.01" step="any" value={seconds} onChange={e => { setSeconds(e.target.value); recordUse(); }} /></label>
        <div className="calculator-answer" aria-live="polite"><output aria-label="Calculated WPM">{valid ? (count * 12 / duration).toLocaleString("en-US", { maximumFractionDigits: 1 }) : "—"}</output><span>WPM</span></div>
      </div>
      <p className="tool-note">{valid ? `(${count} characters ÷ 5) ÷ (${duration} seconds ÷ 60)` : "Enter a whole character count of zero or more and a time greater than zero."}</p>
      <p className="tool-note">Count spaces and punctuation as characters. “Eligible” means the characters included by your test’s scoring rules. This illustrates the basic formula; it does not reproduce a completed test or apply an error penalty.</p>
    </div>
  );
}
