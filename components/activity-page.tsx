import { PracticeSession } from "./practice-session";
import Link from "next/link";
import { ProductFigure, ActivityLinks } from "./editorial";
import { StartActivity } from "./start-activity";
const activities = {
  friends: {
    eyebrow: "multiplayer / 2–5 racers",
    title: "Typing races with friends.",
    accent: "Same quote. Shared start.",
    description:
      "A private room, your favorite people, and a little friendly competition. Race real quotes together, right in your browser.",
    cta: "create a friends room",
    image: "lobby",
    alt: "Private typing race lobby with invite and ready controls",
    caption:
      "Share the room link, ready up, and let the host start the countdown.",
    guide: "host-a-typing-race-with-friends",
    guideLabel: "how to host your first race",
    steps: [
      [
        "Invite your people",
        "Create a room and copy its link. Up to five people can join, including you. Everyone can play as a guest.",
      ],
      [
        "Start together",
        "Everyone readies up, then the host starts a shared countdown. Each racer types exactly the same quote.",
      ],
      [
        "Make it a rematch",
        "Correct mistakes to finish, compare this race’s standings, and let the host open another round once the race ends.",
      ],
    ],
  },
  minute: {
    eyebrow: "solo practice / 60 seconds",
    title: "One minute. Find your pace.",
    accent: "A 1-minute typing test.",
    description:
      "A focused sixty seconds to check your typing speed and accuracy. Start the timer with your first keystroke, then see how your rhythm unfolds.",
    cta: "start a one-minute test",
    image: "results",
    alt: "Typing test results showing speed, accuracy, and performance over time",
    caption:
      "Every practice result gives you more than one number: speed, accuracy, and a chart of your run.",
    guide: "how-is-typing-wpm-calculated",
    guideLabel: "understand your typing score",
    steps: [
      [
        "Type to begin",
        "The test above starts in time mode with 60 seconds selected. Your other language and typing preferences stay yours.",
      ],
      [
        "Keep a steady rhythm",
        "Work through the word list until time runs out. Try to read ahead without racing past your accuracy.",
      ],
      [
        "Find your baseline",
        "Review WPM and accuracy together. Repeat with the same language and punctuation settings for a fair comparison.",
      ],
    ],
  },
  quote: {
    eyebrow: "solo practice / real passages",
    title: "Words with a little meaning.",
    accent: "Quote typing practice.",
    description:
      "Practice the capitals, punctuation, and natural phrasing of real passages. Settle into a quote and give accuracy a little room to grow.",
    cta: "practice a quote",
    image: "practice",
    alt: "Quote typing practice with quote length options and a passage ready to type",
    caption:
      "Choose a quote length in the toolbar and begin with your first keystroke.",
    guide: "improve-typing-accuracy",
    guideLabel: "build a more accurate typing habit",
    steps: [
      [
        "Pick your length",
        "Choose short, medium, long, or all lengths from the toolbar above. Begin when you are ready.",
      ],
      [
        "Follow the text",
        "Type the passage as shown. Capitals and punctuation give you something more varied than an everyday word list.",
      ],
      [
        "Learn from the run",
        "Check the result, review your mistakes, and try another quote. Focus on one recurring error at a time.",
      ],
    ],
  },
};
export function ActivityPage({ mode }: { mode: keyof typeof activities }) {
  const a = activities[mode];
  return (
    <div className={`editorial ${mode !== "friends" ? "practice-landing" : ""}`}>
      <header className="editorial-hero activity-hero">
        <p className="editorial-eyebrow">{a.eyebrow}</p>
        <h1>
          {mode === "friends" ? a.title : mode === "minute" ? "A one-minute typing test." : "Quote typing practice."}
          {mode === "friends" && <><br /><em>{a.accent}</em></>}
        </h1>
        <p className="editorial-deck">{a.description}</p>
        {mode === "friends" && <StartActivity mode={mode}>{a.cta}</StartActivity>}
        <p className="activity-note">no account needed · free to play</p>
      </header>
      {mode === "friends" ? <ProductFigure image={a.image} alt={a.alt} caption={a.caption} priority /> : (
        <section className="landing-practice" aria-label={mode === "minute" ? "One-minute typing test" : "Quote typing exercise"}>
          <PracticeSession key={mode} minute={mode === "minute"} />
        </section>
      )}
      <section className="activity-steps" aria-label="How it works">
        {a.steps.map(([title, text], i) => (
          <div key={title}>
            <span className="step-number">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <section className="activity-guide">
        <span className="editorial-eyebrow">a useful next read</span>
        <Link href={`/guides/${a.guide}`}>{a.guideLabel} →</Link>
      </section>
      <section className="editorial-bottom">
        <h2>Another way to practice.</h2>
        <ActivityLinks />
      </section>
    </div>
  );
}
