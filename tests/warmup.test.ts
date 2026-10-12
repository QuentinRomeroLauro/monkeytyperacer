import { describe,it,expect } from "vitest";
import {newWarmup,recordWarmup,finishWarmup} from "../lib/warmup";
describe("homepage quote results",()=>{
 it("starts at the first typed character, keeps corrected errors, and includes pauses",()=>{
  let s=newWarmup();
  s=recordWarmup(s,"hi","delete",undefined,0);expect(s.startedAt).toBeNull();
  s=recordWarmup(s,"hi","insert","h",100000);
  s=recordWarmup(s,"hi","insert","x",100500);
  s=recordWarmup(s,"hi","delete",undefined,101000);
  s=recordWarmup(s,"hi","insert","i",102000);
  const result=finishWarmup(s,102000);
  expect(result.duration).toBe(2);expect(result.wpm).toBe(12);
  expect(result.accuracy).toBeCloseTo(200/3);expect(result.errors).toBe(1);
  expect(result.samples.map(p=>p.second)).toEqual([1,2]);
  expect(result.samples.reduce((n,p)=>n+p.errors,0)).toBe(1);
 });
 it("retains a fractional finish and resets between quotes",()=>{
  let s=recordWarmup(newWarmup(),"ab","insert","a",100);
  s=recordWarmup(s,"ab","insert","b",1350);
  expect(finishWarmup(s,1350).samples.at(-1)?.second).toBe(1.25);
  expect(newWarmup()).toMatchObject({startedAt:null,attempts:0,errors:0,typed:""});
 });
});
