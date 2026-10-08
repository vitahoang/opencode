import { describe, expect, test } from "bun:test"
import { code, head, logoVariants, mark, pickLogo, vita } from "../src/vita"

const cols = (lines: string[]) => Math.max(...lines.map((line) => Array.from(line).length))

describe("vita logo variants", () => {
  test("sizes come from the glyph data", () => {
    const size = Object.fromEntries(logoVariants.map((v) => [v.name, [v.width, v.height]]))
    expect(size).toEqual({
      lockup: [cols(head) + 2 + cols(vita) + 1 + cols(code), head.length / 2],
      wordmark: [cols(vita) + 1 + cols(code), vita.length],
      stacked: [Math.max(cols(vita), cols(code)), vita.length * 2],
      vita: [cols(vita), vita.length],
      mark: [cols(mark), mark.length],
    })
  })

  test("never picks a variant wider or taller than the room", () => {
    for (let width = 0; width <= 120; width++)
      for (let height = 0; height <= 20; height++) {
        const picked = logoVariants.find((v) => v.name === pickLogo(width, height))
        if (!picked) continue
        expect(picked.width).toBeLessThanOrEqual(width)
        expect(picked.height).toBeLessThanOrEqual(height)
      }
  })

  test("falls back to a smaller variant when the room is short", () => {
    expect(pickLogo(50, 4)).toBe("lockup")
    expect(pickLogo(49, 4)).toBe("wordmark")
    expect(pickLogo(30, 8)).toBe("stacked")
    expect(pickLogo(30, 7)).toBe("vita")
    expect(pickLogo(80, 3)).toBe("mark")
    expect(pickLogo(80, 2)).toBeUndefined()
    expect(pickLogo(3, 100)).toBeUndefined()
  })
})
