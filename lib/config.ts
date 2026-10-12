export type Mode = "time" | "words" | "quote" | "zen" | "custom";
export type Config = {
  designVersion: number;
  mode: Mode;
  time: number;
  words: number;
  quoteLength: "all" | "short" | "medium" | "long" | "thicc";
  punctuation: boolean;
  numbers: boolean;
  language: string;
  theme: string;
  fontFamily: string;
  fontSize: number;
  difficulty: "normal" | "expert" | "master";
  stopOnError: "off" | "word" | "letter";
  confidenceMode: "off" | "on" | "max";
  freedomMode: boolean;
  quickEnd: boolean;
  blindMode: boolean;
  showAllLines: boolean;
  smoothCaret: boolean;
  caretStyle: "line" | "block" | "underline";
  liveWpm: boolean;
  liveAccuracy: boolean;
  timerStyle: "mini" | "bar" | "off";
  showKeyTips: boolean;
  colorfulMode: boolean;
  flipTestColors: boolean;
  keymap: boolean;
  sound: "off" | "click" | "typewriter" | "beep";
  errorSound: boolean;
  soundVolume: number;
  paceCaret: number;
  minWpm: number;
  minAccuracy: number;
  quickRestart: boolean;
  customText: string;
  customRandom: boolean;
  customWordCount: number;
  customTheme: boolean;
  customColors: { bg: string; main: string; sub: string; text: string };
};
export const defaults: Config = {
  designVersion: 1,
  mode: "quote",
  time: 30,
  words: 50,
  quoteLength: "medium",
  punctuation: false,
  numbers: false,
  language: "english",
  theme: "typeracer_dark",
  fontFamily: "Roboto Mono",
  fontSize: 32,
  difficulty: "normal",
  stopOnError: "off",
  confidenceMode: "off",
  freedomMode: false,
  quickEnd: false,
  blindMode: false,
  showAllLines: false,
  smoothCaret: true,
  caretStyle: "line",
  liveWpm: false,
  liveAccuracy: false,
  timerStyle: "mini",
  showKeyTips: true,
  colorfulMode: false,
  flipTestColors: false,
  keymap: false,
  sound: "off",
  errorSound: false,
  soundVolume: 0.5,
  paceCaret: 0,
  minWpm: 0,
  minAccuracy: 0,
  quickRestart: false,
  customText: "The quick brown fox jumps over the lazy dog.",
  customRandom: false,
  customWordCount: 50,
  customTheme: false,
  customColors: {
    bg: "#323437",
    main: "#4da8e8",
    sub: "#646669",
    text: "#d1d0c5",
  },
};
export type Sample = {
  second: number;
  wpm: number;
  raw: number;
  errors: number;
};
export type TestResult = {
  id: string;
  createdAt: string;
  mode: Mode;
  mode2: number;
  language: string;
  punctuation: boolean;
  numbers: boolean;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  duration: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  samples: Sample[];
  words: string[];
  typed: string[];
  difficulty: string;
  failed: boolean;
  quoteSource?: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};
export const EMPTY_RESULTS: TestResult[] = [];

// Upgrade the old default once; explicit alternative and custom themes survive.
export function migrateConfig(saved: Partial<Config>): Partial<Config> {
  if ((saved.designVersion ?? 0) >= 1) return saved;
  return {
    ...saved,
    designVersion: 1,
    ...(!saved.customTheme && (!saved.theme || saved.theme === "serika_dark")
      ? { theme: "typeracer_dark" }
      : {}),
  };
}
