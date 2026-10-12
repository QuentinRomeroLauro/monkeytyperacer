export const guides = [
  {
    slug: "how-is-typing-wpm-calculated",
    category: "understand your score",
    title: "What your WPM actually means.",
    searchTitle: "How is typing WPM calculated?",
    description:
      "Understand words per minute, raw speed, and accuracy—and why the same typist can get different scores on different tests.",
    minutes: 4,
    image: "results",
    imageAlt:
      "Monkeytype Racer practice results showing WPM, accuracy, and a speed chart",
    caption:
      "A completed practice test separates speed, accuracy, and the rhythm of your run.",
    mode: "minute" as const,
    cta: "try a one-minute test",
    sections: [
      {
        id: "the-formula",
        title: "Five characters make one word.",
        paragraphs: [
          "Typing tests usually use a standardized word of five characters rather than counting dictionary words. That makes a passage with long words easier to compare with one full of short words. Divide the eligible character count by five, then divide by the time in minutes.",
          "For example, 300 eligible characters in 60 seconds is 60 WPM. The same 300 characters in 30 seconds is 120 WPM. Spaces matter, too: they are part of the text you type.",
        ],
        callout: "WPM = (eligible characters ÷ 5) ÷ elapsed minutes",
      },
      {
        id: "what-counts",
        title: "What counts on Monkeytype Racer?",
        paragraphs: [
          "In a race, speed uses the correctly typed prefix of the shared quote and elapsed time from the shared start. You must fix mistakes before you can finish. The time spent correcting them stays on the clock, so careful typing matters as much as quick fingers.",
          "Solo practice calculates WPM from fully correct completed words, including their following spaces, plus a correctly typed prefix of the current word. Raw WPM uses typing attempts instead. It can be higher because it includes work that did not become correct text. Race standings belong to that race; the global practice leaderboard is separate.",
        ],
      },
      {
        id: "score-types",
        title: "Raw speed, accuracy, and a correct finish.",
        paragraphs: [
          "Raw speed counts typing attempts. Accuracy asks what share of those attempts were correct. Corrected WPM counts the eligible text produced over elapsed time. These numbers answer different questions; multiplying raw WPM by accuracy does not necessarily reproduce a test’s reported WPM.",
          "Some tests subtract uncorrected errors per minute from gross WPM. Monkeytype Racer uses the eligible-character rules above instead. Backspacing takes time, and the original incorrect attempt still affects accuracy. Compare results within the same mode and settings rather than assuming every site uses the same error penalty.",
        ],
      },
      {
        id: "accuracy",
        title: "Accuracy tells the other half.",
        paragraphs: [
          "Accuracy measures correct typing attempts as a percentage of all typing attempts. If 285 of 300 attempts are correct, that is 95% accuracy. Fixing a typo does not erase the original mistake from your accuracy score.",
          "Read speed and accuracy together. A higher raw speed with frequent corrections can feel fast while producing less useful text. In a race, a smoother run with fewer stops can beat a frantic one.",
        ],
      },
      {
        id: "compare",
        title: "Compare like with like.",
        paragraphs: [
          "Keep duration, language, punctuation, and mode consistent when you track progress. A short familiar word list and a long quote with capitals are different tasks. Neither score tells the whole story.",
          "Use several runs to find your usual range instead of treating one personal best as your baseline. Try a one-minute test today, repeat the same settings next time, and look for both steadier accuracy and more comfortable speed.",
        ],
      },
    ],
  },
  {
    slug: "improve-typing-accuracy",
    category: "build a better habit",
    title: "Get it right. Then get faster.",
    searchTitle: "How to improve typing accuracy",
    description:
      "A practical typing routine for fewer mistakes: slow down, spot repeated errors, practice difficult words, and build a steady rhythm.",
    minutes: 5,
    image: "practice",
    imageAlt:
      "Quote practice in Monkeytype Racer with the quote mode and length controls visible",
    caption:
      "Quote practice adds the capitals, punctuation, and phrasing you meet in everyday writing.",
    mode: "quote" as const,
    cta: "practice a quote",
    sections: [
      {
        id: "slow-down",
        title: "Start at a pace you can control.",
        paragraphs: [
          "Begin with a short quote and type slowly enough to read what comes next. Your first goal is a clean run, not a personal best. A useful personal target is at least 97% accuracy, but start with an achievable improvement over your own baseline.",
          "If you keep making the same mistake, reduce your pace. Keep your shoulders relaxed and your hands comfortable. Stop and take a break if typing hurts; forcing extra repetitions is not the goal.",
        ],
      },
      {
        id: "notice",
        title: "Look for a pattern, not just a number.",
        paragraphs: [
          "After a practice test, inspect the character history and ask what interrupted you. Was it a capital letter, an apostrophe, a repeated letter, or a word you anticipated incorrectly? Pick one recurring issue for the next run.",
          "The practice results include a missed-word practice action when there are mistakes to revisit. You can also use custom text to repeat a few difficult words. Keep the exercise short enough that you are still paying attention.",
        ],
      },
      {
        id: "drills",
        title: "Pick one thing to practice.",
        paragraphs: [
          "Choose the exercise that matches your last mistake. Type it once at a comfortable pace, review the result, then repeat. These are short practice prompts, not timed challenges or promises of a particular improvement.",
          "On the results screen, open “words history” to see which words differed from the passage. If there are mistakes, “practice missed words” appears below the main result controls and starts a custom exercise containing those words.",
        ],
      },
      {
        id: "routine",
        title: "A five-minute routine to try.",
        paragraphs: [
          "Minute one: warm up with an easy quote at a comfortable pace. Minutes two and three: focus on one recurring error using missed-word practice or custom text. Minute four: type a fresh quote, letting accuracy set your speed. Minute five: review the result and note one thing to repeat tomorrow.",
          "This is a suggested practice structure, not a promise of a particular WPM gain. Adjust it to your attention and comfort. A few focused minutes are easier to repeat than an exhausting session.",
        ],
        callout: "One session. One recurring mistake. One small improvement.",
      },
      {
        id: "race",
        title: "Bring that rhythm into a race.",
        paragraphs: [
          "When you race, every player gets the same quote and shared start. Keep your eyes on your text instead of constantly checking the progress bars. Correct errors as they happen; an uncorrected mistake prevents a completed finish.",
          "Use solo practice to work on technique and friend races to make practice social. Compare your own accuracy across similar tests, rather than judging your progress by whether you win every room.",
        ],
      },
    ],
  },
  {
    slug: "host-a-typing-race-with-friends",
    category: "a little competition",
    title: "Good company. Great races.",
    searchTitle: "How to host a typing race with friends",
    description:
      "Create a private typing room, share an invite link, ready up, and race the same quote with up to five people. No account required.",
    minutes: 5,
    image: "lobby",
    imageAlt:
      "A private Monkeytype Racer lobby with an invite link, ready controls, and a host start button",
    caption:
      "A private room keeps the invite, readiness, and start controls in one place.",
    mode: "friends" as const,
    cta: "create a friends room",
    sections: [
      {
        id: "create",
        title: "01 / Make a room.",
        paragraphs: [
          "Choose “race a friend” on the homepage, or use the create-room button below. Enter a racer name if you want one; you can race as a guest without creating an account. A private room supports up to five racers, including the host.",
          "Use a keyboard for the intended typing experience. Everyone needs the room link and an internet connection. You do not need to install an app.",
        ],
      },
      {
        id: "invite",
        title: "02 / Send the invite.",
        paragraphs: [
          "Copy the invite link from the lobby and share it with the people you want to race. They open the link, choose a name, and join the room. Anyone with the link can reach the room, so share it with your intended group.",
          "Room links are temporary and rooms can be rejoined for 24 hours. Create a fresh room for another day instead of treating an old invitation as a permanent event link.",
        ],
      },
      {
        id: "ready",
        title: "03 / Ready, set, type.",
        paragraphs: [
          "Each racer selects “i’m ready”. With at least two racers and everyone ready, the host can start the race. A shared countdown gives everyone the same start time, and the same quote appears for all racers.",
          "Type the quote as shown, including punctuation and capitals. Use Backspace to correct mistakes. You must finish the quote correctly; progress bars show where everyone is, and standings show completed finish times.",
        ],
      },
      {
        id: "series",
        title: "Two wins take the series.",
        paragraphs: [
          "For two players, try a best-of-three. For a group of up to five, keep everyone in the same private room and award one round win to the first correct finisher shown in the standings. The first person to win two rounds wins the series. With more than two racers, the series can take more than three rounds; play until someone reaches two wins. These are suggested house rules, not an automatic tournament mode.",
          "For example, Alice wins round one, Ben wins round two, and Alice wins round three: record Alice 2, Ben 1. Keep the tally in a shared note. Use the displayed finish order, not rounded WPM, to decide a round. If the result is genuinely unclear, agree to replay it.",
          "Before starting, agree whether a disconnect means replaying the round or recording the remaining finishers. Apply the same choice to everyone. If the whole room loses connection, pause the series and create a fresh room if needed. Race standings are for the current round; they do not maintain your series tally.",
        ],
        callout: "Invite to copy: Join my typing race! Open the room link below, choose a name, and select “i’m ready”. We’ll race the same quote. First to two round wins takes the series. We’ll agree our disconnect rule before starting. [Paste your fresh room link here.]",
      },
      {
        id: "again",
        title: "04 / Give them a rematch.",
        paragraphs: [
          "After the round ends, the host can start a rematch in the same room. Everyone readies up again for a new round. A simple best-of-three gives your group a reason to keep playing without making the session long.",
          "After a completed finish, save a result card or copy your result. To challenge someone new, create a fresh friends room from the results. This gives the recipient a room they can join, rather than sending them into a race that already ended.",
        ],
      },
    ],
  },
];
