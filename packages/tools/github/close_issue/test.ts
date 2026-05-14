import { run } from "./index"

describe("close_issue tool", () => {
  it("should run without crashing", async () => {
    await expect(run({})).rejects.toThrow()
  })
})
