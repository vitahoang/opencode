// VitaCode branding glyphs, shared by the home_logo plugin and the exit banner.
// Wordmark marks follow logo.ts: "_" shadow cell, "^" fg over shadow, "~" shadow top half.

// "vita": row 0 holds the dot of "i" and the stem of "t", so narrow layouts must keep it.
export const vita = ["     ▀ █       ", "█  █ █ █▀▀ ▀▀▀█", "▀▄▄▀ █ █__ █^^█", " ▀▀  ▀ ▀▀▀ ▀▀▀▀"]
export const code = ["             ▄     ", "█▀▀▀ █▀▀█ █▀▀█ █▀▀█", "█___ █__█ █__█ █^^^", "▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀"]

// Vita mascot head, 13x8 pixels drawn as 13 cols x 4 rows of half blocks (same height as the wordmark).
// B body, E ear, F face, "." empty (the eyes are holes in the face).
export const head = [
  "......B......",
  ".....BBB.....",
  "E..BBBBBBB..E",
  "EEBBFFBFFBBEE",
  ".EBF.FFF.FBE.",
  ".EBF.FFF.FBE.",
  "..BFFFFFFFB..",
  "...BBBBBBB...",
]

// Closed eyes: the upper eye pixels fill with face, a thin line stays in the lower half of the row.
export const headBlink = [...head.slice(0, 4), ".EBFFFFFFFBE.", ...head.slice(5)]

// Squint glance: both eyes narrow to a slit (S, drawn as ▂) and move dx pixels left (-1) or right (+1).
export function headSquint(dx: number) {
  return head.map((line, y) => {
    if (y !== 4 && y !== 5) return line
    const px = [...line]
    for (const x of [4, 8]) px[x] = "F"
    for (const x of [4, 8]) px[x + dx] = "S"
    return px.join("")
  })
}

// Monogram ("v" of the wordmark) for terminals too narrow for "vita".
export const mark = ["█  █", "▀▄▄▀", " ▀▀ "]

// Logo variants, largest first. Each is drawn only when its glyph size plus the free columns it needs
// beside it fits the room; otherwise the next one is tried. The margins keep the Home breakpoints at
// 54 / 42 / 22 / 17 terminal columns.
export type LogoVariant = "lockup" | "wordmark" | "stacked" | "vita" | "mark"
const cols = (lines: string[]) => Math.max(...lines.map((line) => Array.from(line).length))
const wordmark = cols(vita) + 1 + cols(code)
export const logoVariants: { name: LogoVariant; width: number; height: number; margin: number }[] = [
  { name: "lockup", width: cols(head) + 2 + wordmark, height: head.length / 2, margin: 0 },
  { name: "wordmark", width: wordmark, height: vita.length, margin: 5 },
  { name: "stacked", width: Math.max(cols(vita), cols(code)), height: vita.length * 2, margin: 1 },
  { name: "vita", width: cols(vita), height: vita.length, margin: 0 },
  { name: "mark", width: cols(mark), height: mark.length, margin: 0 },
]

export function pickLogo(width: number, height: number) {
  return logoVariants.find((variant) => variant.width + variant.margin <= width && variant.height <= height)?.name
}
