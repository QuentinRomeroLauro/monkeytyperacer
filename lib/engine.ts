import type { Config, Sample, TestResult } from "./config";
export type Session = {
  words: string[];
  typed: string[];
  input: string;
  index: number;
  startedAt: number | null;
  endedAt: number | null;
  now: number;
  attempts: number;
  hits: number;
  errors: number;
  samples: Sample[];
  failed: boolean;
  quoteSource?: string;
};
export function newSession(words: string[], quoteSource?: string): Session {
  return {
    words,
    typed: [],
    input: "",
    index: 0,
    startedAt: null,
    endedAt: null,
    now: 0,
    attempts: 0,
    hits: 0,
    errors: 0,
    samples: [],
    failed: false,
    quoteSource,
  };
}
export function counts(s: Session) {
  let correct = 0,
    incorrect = 0,
    extra = 0,
    missed = 0,
    wordCorrect = 0;
  const typed = [...s.typed];
  if (s.input) typed[s.index] = s.input;
  typed.forEach((value, index) => {
    const expected = s.words[index] ?? "";
    [...value].forEach((char, i) => {
      if (i >= expected.length) extra++;
      else if (char === expected[i]) correct++;
      else incorrect++;
    });
    if (index < s.index) {
      missed += Math.max(0, expected.length - value.length);
      if (value === expected) wordCorrect += expected.length + 1;
    } else if (expected.startsWith(value)) wordCorrect += value.length;
  });
  return { correct, incorrect, extra, missed, wordCorrect };
}
export function metrics(s: Session) {
  const duration =
    s.startedAt === null
      ? 0
      : Math.max(0, ((s.endedAt ?? s.now) - s.startedAt) / 1000);
  const count = counts(s);
  return {
    ...count,
    duration,
    wpm: duration ? count.wordCorrect / 5 / (duration / 60) : 0,
    raw: duration ? s.attempts / 5 / (duration / 60) : 0,
    accuracy: s.attempts ? (s.hits / s.attempts) * 100 : 100,
  };
}
export function typeInput(
  s: Session,
  value: string,
  now: number,
  config: Config,
): Session {
  if (s.endedAt !== null) return s;
  if (value.length < s.input.length && config.confidenceMode === "max")
    return s;
  const next = { ...s, input: value, now };
  if (value.length > s.input.length) {
    if (s.startedAt === null) next.startedAt = now;
    const added = value.slice(s.input.length);
    let hits = 0;
    [...added].forEach((char, i) => {
      if (
        config.mode === "zen" ||
        char === s.words[s.index]?.[s.input.length + i]
      )
        hits++;
    });
    next.attempts += added.length;
    next.hits += hits;
    next.errors += added.length - hits;
    if (hits < added.length && config.stopOnError === "letter")
      next.input = s.input;
    if (hits < added.length && config.difficulty === "master")
      return { ...next, endedAt: now, failed: true };
  }
  if (config.mode === "zen") next.words = [...s.words.slice(0, s.index), value];
  if (
    config.quickEnd &&
    config.mode !== "time" &&
    config.mode !== "zen" &&
    s.index === s.words.length - 1 &&
    value.length >= (s.words[s.index]?.length ?? 0)
  )
    return { ...next, endedAt: now };
  if (
    config.mode !== "time" &&
    config.mode !== "zen" &&
    s.index === s.words.length - 1 &&
    value === s.words[s.index]
  )
    return { ...next, endedAt: now };
  return next;
}
export function commitWord(s: Session, now: number, config: Config): Session {
  if (s.endedAt !== null || !s.input) return s;
  const correct = config.mode === "zen" || s.input === s.words[s.index];
  if (!correct && config.difficulty === "expert")
    return { ...s, now, endedAt: now, failed: true };
  if (!correct && config.stopOnError === "word")
    return { ...s, errors: s.errors + 1, attempts: s.attempts + 1 };
  const next = {
    ...s,
    now,
    typed: [...s.typed.slice(0, s.index), s.input],
    input: "",
    index: s.index + 1,
    attempts: s.attempts + 1,
    hits: s.hits + (correct ? 1 : 0),
  };
  if (config.mode === "zen") next.words = [...s.words, ""];
  else if (next.index >= s.words.length) next.endedAt = now;
  return next;
}
export function previousWord(s: Session, config: Config): Session {
  if (
    s.input ||
    s.index === 0 ||
    config.confidenceMode !== "off" ||
    s.endedAt !== null
  )
    return s;
  if (!config.freedomMode && s.typed[s.index - 1] === s.words[s.index - 1])
    return s;
  return {
    ...s,
    index: s.index - 1,
    input: s.typed[s.index - 1],
    typed: s.typed.slice(0, -1),
  };
}
export function tick(s: Session, now: number, config: Config): Session {
  if (s.startedAt === null || s.endedAt !== null) return s;
  let next = { ...s, now };
  const elapsed = (now - s.startedAt) / 1000;
  if (config.mode === "time" && elapsed >= config.time)
    next = {
      ...next,
      now: s.startedAt + config.time * 1000,
      endedAt: s.startedAt + config.time * 1000,
    };
  const second = Math.floor(
    Math.min(elapsed, config.mode === "time" ? config.time : Infinity),
  );
  const m = metrics(next);
  if (second > 0 && second > (s.samples.at(-1)?.second ?? 0))
    next.samples = [
      ...s.samples,
      {
        second,
        wpm: m.wpm,
        raw: m.raw,
        errors: s.errors - s.samples.reduce((a, b) => a + b.errors, 0),
      },
    ];
  if (
    elapsed >= 3 &&
    ((config.minWpm > 0 && m.wpm < config.minWpm) ||
      (config.minAccuracy > 0 && m.accuracy < config.minAccuracy))
  )
    next = { ...next, endedAt: now, failed: true };
  return next;
}
export function resultFrom(s: Session, config: Config): TestResult {
  const m = metrics(s),
    values = s.samples.map((x) => x.raw);
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const deviation = Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (values.length || 1),
  );
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    mode: config.mode,
    mode2:
      config.mode === "time"
        ? config.time
        : config.mode === "words"
          ? config.words
          : s.words.length,
    language: config.language,
    punctuation: config.punctuation,
    numbers: config.numbers,
    ...m,
    consistency: mean ? Math.max(0, 100 - (deviation / mean) * 100) : 0,
    samples: s.samples,
    words: s.words.slice(0, s.index + 1),
    typed: [...s.typed, ...(s.input ? [s.input] : [])],
    difficulty: config.difficulty,
    failed: s.failed,
    quoteSource: s.quoteSource,
  };
}
export function generateWords(
  source: string[],
  count: number,
  config: Pick<Config, "punctuation" | "numbers">,
  random = Math.random,
): string[] {
  const output: string[] = [];
  for (let i = 0; i < count; i++) {
    let word = source[Math.floor(random() * source.length)] || "type";
    if (source.length > 1 && word === output.at(-1))
      word = source[(source.indexOf(word) + 1) % source.length];
    if (config.numbers && random() < 0.1)
      word = String(Math.floor(random() * 10000));
    if (config.punctuation) {
      if (i === 0 || /[.!?]$/.test(output.at(-1) ?? ""))
        word = word[0].toUpperCase() + word.slice(1);
      if (random() < 0.2)
        word += [",", ".", "?", ";", "!"][Math.floor(random() * 5)];
    }
    output.push(word);
  }
  return output;
}
