import { describe, expect, it } from "vitest";
import { defaults, migrateConfig } from "../lib/config";
import { configSchema } from "../lib/config-schema";

describe("blue design migration", () => {
  it("upgrades legacy default settings without losing typing preferences", () => {
    expect(migrateConfig({ theme: "serika_dark", time: 60 })).toEqual({
      theme: "typeracer_dark", time: 60, designVersion: 1,
    });
    expect(defaults.theme).toBe("typeracer_dark");
  });
  it("preserves alternative themes, custom palettes, and later Serika selections", () => {
    expect(migrateConfig({ theme: "nord" }).theme).toBe("nord");
    const custom = { theme: "serika_dark", customTheme: true, customColors: defaults.customColors };
    expect(migrateConfig(custom)).toMatchObject(custom);
    const chosen = { theme: "serika_dark", designVersion: 1 };
    expect(migrateConfig(chosen)).toBe(chosen);
  });
  it("round-trips the migration marker through cloud validation", () => {
    expect(configSchema.parse(defaults)).toEqual(defaults);
  });
  it("moves saved restricted Danish lists to the available basic list", () => {
    for (const language of ["danish_1k", "danish_10k"]) {
      expect(migrateConfig({ ...defaults, language, time: 60 })).toMatchObject({
        language: "danish", time: 60, designVersion: 1,
      });
    }
  });
});
