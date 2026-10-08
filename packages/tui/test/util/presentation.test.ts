import { expect, test } from "bun:test"
import { RGBA } from "@opentui/core"
import { sessionEpilogue } from "../../src/util/presentation"

test("formats session continuation summary", () => {
  const epilogue = sessionEpilogue({ title: "A session", sessionID: "ses_123" })
  expect(epilogue).toContain("A session")
  expect(epilogue).toContain("opencode -s ses_123")
})

test("paints the wordmark and mascot head with the theme colors", () => {
  const colors = {
    vita: RGBA.fromInts(82, 172, 252),
    code: RGBA.fromInts(237, 237, 237),
    background: RGBA.fromInts(10, 10, 11),
  }
  const epilogue = sessionEpilogue({ title: "A session", sessionID: "ses_123", colors })
  expect(epilogue).toContain("\x1b[38;2;82;172;252m")
  expect(epilogue).toContain("opencode -s ses_123")
})
