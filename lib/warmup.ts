import { correctPrefix, editText, type RaceEdit } from "./race";
import type { Sample } from "./config";
type Point = { at: number; correct: number; attempts: number; errors: number };
export type WarmupSession = { startedAt: number | null; typed: string; attempts: number; errors: number; points: Point[] };
export type WarmupResult = { wpm: number; accuracy: number; duration: number; errors: number; samples: Sample[] };
export const newWarmup = (): WarmupSession => ({ startedAt: null, typed: "", attempts: 0, errors: 0, points: [] });
export function recordWarmup(session: WarmupSession, quote: string, type: RaceEdit["type"], text: string | undefined, now: number): WarmupSession {
  if (session.startedAt === null && type === "delete") return session;
  const typed = editText(session.typed, {seq:1,type,text}, quote);
  const attempts = session.attempts + Number(type === "insert");
  const errors = session.errors + Number(type === "insert" && !quote.startsWith(typed));
  return { startedAt: session.startedAt ?? now, typed, attempts, errors,
    points: [...session.points, {at:now,correct:correctPrefix(typed,quote),attempts,errors}] };
}
export function finishWarmup(session: WarmupSession, now: number): WarmupResult {
  const start = session.startedAt ?? now, duration = Math.max(.001,(now-start)/1000);
  const boundaries = Array.from({length:Math.floor(duration)},(_,i)=>i+1);
  if (duration-(boundaries.at(-1)??0)>.001) boundaries.push(duration);
  const samples: Sample[]=[];
  let index=0, previousErrors=0;
  for(const second of boundaries) {
    while(index+1<session.points.length && session.points[index+1].at<=start+second*1000)index++;
    const point=session.points[index];
    samples.push({second,wpm:(point?.correct??0)/5/(second/60),raw:(point?.attempts??0)/5/(second/60),errors:(point?.errors??0)-previousErrors});
    previousErrors=point?.errors??0;
  }
  return {wpm:(session.points.at(-1)?.correct??0)/5/(duration/60),accuracy:session.attempts?(session.attempts-session.errors)/session.attempts*100:100,duration,errors:session.errors,samples};
}
