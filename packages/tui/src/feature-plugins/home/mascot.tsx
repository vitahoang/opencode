import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { RGBA, TextAttributes } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { createEffect, createSignal, For, Index, onCleanup, Show, type JSX } from "solid-js"
import { tint } from "../../context/theme"
import { code, head, headBlink, headSquint, mark, pickLogo, vita } from "../../vita"

const id = "internal:home-mascot"

// Rows the Home screen needs below the logo (spacer, prompt, hints, footer). Below this the logo steps down.
const RESERVED_ROWS = 12

type Lines = (readonly [string, string])[]

// Two pixel rows per text row: top pixel = foreground of ▀, bottom pixel = its background.
const pairs = (grid: string[]): Lines =>
  Array.from({ length: grid.length / 2 }, (_, row) => [grid[row * 2], grid[row * 2 + 1]] as const)
const open = pairs(head)
const closed = pairs(headBlink)
const squint = { center: pairs(headSquint(0)), left: pairs(headSquint(-1)), right: pairs(headSquint(1)) }

// Eye motion as (frame, ms) steps; the head returns to open eyes after each one.
// Blink: eyes closed 130 ms, 1 in 4 is a double blink (second one 140 ms later).
// Squint: half-close, narrow to a slit, look left then right, open again (~2.3 s).
const blinkOnce: [Lines, number][] = [[closed, 130]]
const blinkTwice: [Lines, number][] = [
  [closed, 130],
  [open, 140],
  [closed, 130],
]
const glance: [Lines, number][] = [
  [closed, 70],
  [squint.center, 300],
  [squint.left, 800],
  [squint.right, 800],
  [squint.center, 300],
  [closed, 70],
]

function Mascot(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const dimensions = useTerminalDimensions()
  // Home pads its column by 2 on each side.
  const variant = () => pickLogo(dimensions().width - 4, dimensions().height - RESERVED_ROWS)
  const brand = () => theme().primary

  // Blink every 2.5-6 s; every 12-25 s a squint takes the place of a blink, so the two never overlap.
  // Runs only while the head is on screen and animations are enabled.
  const showHead = () => variant() === "lockup"
  const [eyes, setEyes] = createSignal(open)
  createEffect(() => {
    setEyes(open)
    if (!showHead() || !props.api.kv.get("animations_enabled", true)) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const nextSquint = () => Date.now() + 12000 + Math.random() * 13000
    let squintAt = nextSquint()
    const play = (steps: [Lines, number][]) => {
      const [step, ...rest] = steps
      if (!step) {
        setEyes(open)
        return wait()
      }
      setEyes(step[0])
      timer = setTimeout(() => play(rest), step[1])
    }
    const wait = () => {
      const delay = 2500 + Math.random() * 3500
      if (Date.now() + delay < squintAt) {
        timer = setTimeout(() => play(Math.random() < 0.25 ? blinkTwice : blinkOnce), delay)
        return
      }
      timer = setTimeout(
        () => {
          squintAt = nextSquint()
          play(glance)
        },
        Math.max(0, squintAt - Date.now()),
      )
    }
    wait()
    onCleanup(() => clearTimeout(timer))
  })

  const renderLine = (line: string, fg: RGBA, bold: boolean): JSX.Element[] => {
    const shadow = tint(theme().background, fg, 0.25)
    const attrs = bold ? TextAttributes.BOLD : undefined
    return Array.from(line).map((char) => {
      if (char === "_")
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            {" "}
          </text>
        )
      if (char === "^")
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      if (char === "~")
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      return (
        <text fg={fg} attributes={attrs} selectable={false}>
          {char}
        </text>
      )
    })
  }

  // Body in the brand color, ears the brand color 60% over the background, face in base text.
  const paint = (px: string | undefined) => {
    if (px === "B") return brand()
    if (px === "E") return tint(theme().background, brand(), 0.6)
    if (px === "F") return theme().text
    return undefined
  }
  const renderHeadLine = ([top, bottom]: readonly [string, string]): JSX.Element[] =>
    Array.from(top).map((px, index) => {
      const below = bottom[index]
      // Squint slit: face with a thin strip of background at the bottom of the cell.
      if (px === "S")
        return (
          <text fg={theme().background} bg={theme().text} selectable={false}>
            ▂
          </text>
        )
      const fg = paint(px)
      const bg = paint(below)
      if (!fg && !bg) return <text selectable={false}> </text>
      if (!bg)
        return (
          <text fg={fg} selectable={false}>
            ▀
          </text>
        )
      if (!fg)
        return (
          <text fg={bg} selectable={false}>
            ▄
          </text>
        )
      if (px === below)
        return (
          <text fg={fg} selectable={false}>
            █
          </text>
        )
      return (
        <text fg={fg} bg={bg} selectable={false}>
          ▀
        </text>
      )
    })

  return (
    <box alignItems="center">
      {variant() === undefined ? null : variant() === "vita" || variant() === "mark" ? (
        <For each={variant() === "mark" ? mark : vita}>
          {(line) => <box flexDirection="row">{renderLine(line, brand(), false)}</box>}
        </For>
      ) : variant() === "stacked" ? (
        <>
          <For each={vita}>{(line) => <box flexDirection="row">{renderLine(line, brand(), false)}</box>}</For>
          <For each={code}>{(line) => <box flexDirection="row">{renderLine(line, theme().text, true)}</box>}</For>
        </>
      ) : (
        <box flexDirection="row" gap={2}>
          <Show when={showHead()}>
            <box>
              <Index each={eyes()}>{(pair) => <box flexDirection="row">{renderHeadLine(pair())}</box>}</Index>
            </box>
          </Show>
          <box>
            <For each={vita}>
              {(line, index) => (
                <box flexDirection="row" gap={1}>
                  <box flexDirection="row">{renderLine(line, brand(), false)}</box>
                  <box flexDirection="row">{renderLine(code[index()], theme().text, true)}</box>
                </box>
              )}
            </For>
          </box>
        </box>
      )}
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 50,
    slots: {
      home_logo() {
        return <Mascot api={api} />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
