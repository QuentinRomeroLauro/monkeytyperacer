import { z } from "zod";
const flag = z.boolean(),
  number = (min: number, max: number) => z.number().finite().min(min).max(max);
const color = z.string().regex(/^#[\da-f]{6}$/i);
export const configSchema = z
  .object({
    designVersion: number(0, 1).int(),
    mode: z.enum(["time", "words", "quote", "zen", "custom"]),
    time: number(1, 10000).int(),
    words: number(1, 10000).int(),
    quoteLength: z.enum(["all", "short", "medium", "long", "thicc"]),
    punctuation: flag,
    numbers: flag,
    language: z
      .string()
      .regex(/^[\w-]+$/)
      .max(100),
    theme: z
      .string()
      .regex(/^[\w-]+$/)
      .max(100),
    fontFamily: z.enum([
      "Roboto Mono",
      "JetBrains Mono",
      "Fira Code",
      "IBM Plex Mono",
      "Geist Mono",
      "monospace",
    ]),
    fontSize: number(12, 80),
    difficulty: z.enum(["normal", "expert", "master"]),
    stopOnError: z.enum(["off", "word", "letter"]),
    confidenceMode: z.enum(["off", "on", "max"]),
    freedomMode: flag,
    quickEnd: flag,
    blindMode: flag,
    showAllLines: flag,
    smoothCaret: flag,
    caretStyle: z.enum(["line", "block", "underline"]),
    liveWpm: flag,
    liveAccuracy: flag,
    timerStyle: z.enum(["mini", "bar", "off"]),
    showKeyTips: flag,
    colorfulMode: flag,
    flipTestColors: flag,
    keymap: flag,
    sound: z.enum(["off", "click", "typewriter", "beep"]),
    errorSound: flag,
    soundVolume: number(0, 1),
    paceCaret: number(0, 400),
    minWpm: number(0, 400),
    minAccuracy: number(0, 100),
    quickRestart: flag,
    customText: z.string().min(1).max(100000),
    customRandom: flag,
    customWordCount: number(1, 10000).int(),
    customTheme: flag,
    customColors: z.object({ bg: color, main: color, sub: color, text: color }),
  })
  .partial();
