import { createIssue } from "./index";

async function main() {
  const result = await createIssue({
    repo: "ForestMars/sup",
    title: "Agent Test Issue",
    body: "This issue verifies the GitHub tool works.",
    labels: ["agent-test"]
  });

  console.log(result);
}

main();