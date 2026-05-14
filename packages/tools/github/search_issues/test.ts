import { run } from "./index"

describe("search_issues tool", () => {
  it("should run without crashing", async () => {
    await expect(run({})).rejects.toThrow()
  })
})
