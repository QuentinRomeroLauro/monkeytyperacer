const adjectives = ["Turbo", "Wobbly", "Sneaky", "Dizzy", "Spicy", "Sleepy", "Bouncy", "Sassy", "Nimble", "Grumpy", "Fuzzy", "Zippy", "Wiggly", "Cosmic", "Disco", "Noodle"];
const creatures = ["Turnip", "Wombat", "Pancake", "Pickle", "Penguin", "Potato", "Raccoon", "Muffin", "Goose", "Nugget", "Walrus", "Waffle", "Badger", "Banana", "Hamster", "Squid", "Otter", "Llama", "Taco", "Pigeon"];

/** Keep chosen names; replace the old generated Guest names and empty defaults. */
export function racerName(name?: string, seed?: string) {
  const chosen = name?.trim() ?? "";
  if (chosen && !/^Guest(?: \d{4})?$/i.test(chosen)) return chosen;
  let value = 0;
  if (seed !== undefined) {
    value = 2166136261;
    for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  else value = Math.floor(Math.random() * adjectives.length * creatures.length);
  return `${adjectives[value % adjectives.length]} ${creatures[Math.floor(value / adjectives.length) % creatures.length]}`;
}
