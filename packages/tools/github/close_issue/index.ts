/**
 * @file /packages/tools/github/close_issue/index.ts
 * @description Close a GitHub issue.
 */
// import fetch from "node-fetch"; // no cargo culting pls

const token = process.env.GITHUB_TOKEN;
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

export interface CloseIssueParams {
  issue_number: number;
}

export async function closeIssue(params: CloseIssueParams) {
  const { issue_number } = params;

  if (!issue_number) throw new Error("issue_number parameter is required");
  if (!token) throw new Error("GITHUB_TOKEN environment variable not set");

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ state: "closed" })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { issue_number: data.number, state: data.state, url: data.html_url };
}

export async function run(input: CloseIssueParams) {
  return await closeIssue(input);
}