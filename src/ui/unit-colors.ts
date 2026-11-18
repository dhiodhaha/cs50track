import type { CSSProperties } from "react";

export const UNIT_IDS = [
  "week-0",
  "week-1",
  "week-2",
  "week-3",
  "week-4",
  "week-5",
  "week-6",
  "week-7",
  "week-8",
  "week-9",
  "week-10",
  "project",
] as const;
export type UnitId = (typeof UNIT_IDS)[number];

export type Sticker = {
  /** Flat block colour. */
  bg: string;
  /** Text colour on `bg`. Every pair is at least 5:1. */
  ink: string;
  /** What the thumbnail tile shows when no picture is available. */
  glyph: string;
};

/** One sticker per unit, shared by tiles, chips and the pace word. */
export const stickers: Record<UnitId, Sticker> = {
  "week-0": {
    bg: "oklch(0.86 0.17 95)",
    ink: "oklch(0.30 0.07 95)",
    glyph: "0",
  },
  "week-1": {
    bg: "oklch(0.70 0.19 250)",
    ink: "oklch(0.20 0.10 265)",
    glyph: "1",
  },
  "week-2": {
    bg: "oklch(0.78 0.16 165)",
    ink: "oklch(0.26 0.08 170)",
    glyph: "2",
  },
  "week-3": {
    bg: "oklch(0.72 0.19 45)",
    ink: "oklch(0.27 0.09 45)",
    glyph: "3",
  },
  "week-4": {
    bg: "oklch(0.66 0.22 295)",
    ink: "oklch(0.20 0.12 290)",
    glyph: "4",
  },
  "week-5": {
    bg: "oklch(0.80 0.19 140)",
    ink: "oklch(0.27 0.09 145)",
    glyph: "5",
  },
  "week-6": {
    bg: "oklch(0.86 0.10 230)",
    ink: "oklch(0.26 0.09 250)",
    glyph: "6",
  },
  "week-7": {
    bg: "oklch(0.70 0.21 15)",
    ink: "oklch(0.24 0.10 15)",
    glyph: "7",
  },
  "week-8": {
    bg: "oklch(0.82 0.15 75)",
    ink: "oklch(0.28 0.08 60)",
    glyph: "8",
  },
  "week-9": {
    bg: "oklch(0.74 0.14 200)",
    ink: "oklch(0.24 0.07 220)",
    glyph: "9",
  },
  "week-10": {
    bg: "oklch(0.80 0.13 330)",
    ink: "oklch(0.26 0.10 330)",
    glyph: "10",
  },
  project: {
    bg: "oklch(0.20 0 0)",
    ink: "oklch(0.97 0 0)",
    glyph: "star",
  },
};

export function stickerFor(unitId: string): Sticker {
  return stickers[unitId as UnitId] ?? stickers.project;
}

/** The thumbnail artwork a unit may ship; the tile shows without it. */
export const thumbUrl = (unitId: string) => `/thumbs/${unitId}.png`;

export const stickerVars = (unitId: string): CSSProperties =>
  ({
    "--sticker-bg": stickerFor(unitId).bg,
    "--sticker-ink": stickerFor(unitId).ink,
  }) as CSSProperties;
