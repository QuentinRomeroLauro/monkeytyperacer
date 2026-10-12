// Original exercise text; identifiers are safe to share in practice links.
export const practiceDrills = {
  capitals: { title: "Capitals", description: "Alternate hands on Shift and return to a steady rhythm.", text: "Alice met Ben on Monday. Clara and David visited Paris in June. Every Friday, Maya reads a new book." },
  apostrophes: { title: "Apostrophes", description: "Read the whole word before reaching for the apostrophe.", text: "It's a quiet morning. Don't rush; we'll get there. She's ready, and they're waiting. I've checked that it's Sam's turn." },
  repeats: { title: "Repeated letters", description: "Give each repeated letter its own deliberate keystroke.", text: "A little yellow balloon floated past the coffee shop. The happy drummer carried a small green notebook." },
} as const;
export type PracticeDrill = keyof typeof practiceDrills;
export function isPracticeDrill(value: string | undefined): value is PracticeDrill {
  return value !== undefined && Object.hasOwn(practiceDrills, value);
}
