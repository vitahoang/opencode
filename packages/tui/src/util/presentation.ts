import type { RGBA } from "@opentui/core"
import { tint } from "../theme"
import { code, head, vita } from "../vita"

const reset = "\x1b[0m"
const bold = "\x1b[1m"
const dim = "\x1b[90m"

// Theme colors for the wordmark; same roles as the home_logo mascot plugin.
export type EpilogueColors = { vita: RGBA; code: RGBA; background: RGBA }

const channels = (color: RGBA) => [color.r, color.g, color.b].map((x) => Math.round(x * 255)).join(";")
const fgOf = (color: RGBA) => `\x1b[38;2;${channels(color)}m`
const bgOf = (color: RGBA) => `\x1b[48;2;${channels(color)}m`

// Mascot head with the same pixels and roles as the home_logo plugin; two pixel rows per text row.
function mascot(colors: EpilogueColors) {
  const paint = (px: string | undefined) => {
    if (px === "B") return colors.vita
    if (px === "E") return tint(colors.background, colors.vita, 0.6)
    if (px === "F") return colors.code
    return undefined
  }
  return Array.from({ length: head.length / 2 }, (_, row) =>
    [...head[row * 2]]
      .map((px, index) => {
        const below = head[row * 2 + 1][index]
        const top = paint(px)
        const bottom = paint(below)
        if (!top && !bottom) return " "
        if (!bottom) return `${fgOf(top!)}▀${reset}`
        if (!top) return `${fgOf(bottom)}▄${reset}`
        if (px === below) return `${fgOf(top)}█${reset}`
        return `${fgOf(top)}${bgOf(bottom)}▀${reset}`
      })
      .join(""),
  )
}

function wordmark(pad = "", colors?: EpilogueColors) {
  const draw = (line: string, fg: string, shadow: string, bg: string) =>
    [...line]
      .map((char) => {
        if (char === "_") return `${bg} ${reset}`
        if (char === "^") return `${fg}${bg}▀${reset}`
        if (char === "~") return `${shadow}▀${reset}`
        if (char === " ") return " "
        return `${fg}${char}${reset}`
      })
      .join("")

  // Without a theme: terminal default foreground with grey shadows.
  const part = (fg: RGBA | undefined, grey: number) => {
    if (!fg || !colors) return [reset, `\x1b[38;5;${grey}m`, `\x1b[48;5;${grey}m`] as const
    const shadow = tint(colors.background, fg, 0.25)
    return [fgOf(fg), fgOf(shadow), bgOf(shadow)] as const
  }
  const left = part(colors?.vita, 236)
  const right = part(colors?.code, 238)

  // The head needs theme colors and room for head (13) + gap (2) + wordmark (35) + padding.
  const face = colors && (process.stdout.columns ?? 80) >= 54 ? mascot(colors) : undefined

  return vita.map((line, index) => {
    return `${pad}${face ? `${face[index]}  ` : ""}${draw(line, ...left)} ${draw(code[index] ?? "", ...right)}`
  })
}

export function sessionEpilogue(input: { title: string; sessionID?: string; colors?: EpilogueColors }) {
  const weak = (text: string) => `${dim}${text.padEnd(10, " ")}${reset}`
  return [
    ...wordmark("  ", input.colors),
    "",
    `  ${weak("Session")}${bold}${input.title}${reset}`,
    `  ${weak("Continue")}${bold}opencode -s ${input.sessionID}${reset}`,
    "",
  ].join("\n")
}
