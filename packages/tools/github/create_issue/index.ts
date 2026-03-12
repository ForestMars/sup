import fetch from "node-fetch";

export interface CreateIssueParams {
  repo: string; // owner/repo
  title: string;
  body?: string;
  labels?: string[];
}

export async function createIssue(params: CreateIssueParams) {
  const { repo, title, body = "", labels = [] } = params;

  if (!repo) {
    throw new Error("repo parameter is required (owner/repo)");
  }

  if (!title) {
    throw new Error("title parameter is required");
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable not set");
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      body,
      labels
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const data = await res.json();

  return {
    issue_number: data.number,
    url: data.html_url
  };
}

/**
 * Agent entrypoint
 * The agent runner calls this function with tool arguments.
 */
export default async function run(input: CreateIssueParams) {
  return await createIssue(input);
}