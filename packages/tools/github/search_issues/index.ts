/**
 * @file /packages/tools/github/search_issues/index.ts
 * @description Search GitHub issues.
 */
import fetch from "node-fetch";

const token = process.env.GITHUB_TOKEN;
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

export interface SearchIssuesParams {
  query: string;
  state?: "open" | "closed" | "all";
}

export async function searchIssues(params: SearchIssuesParams) {
  const { query, state = "open" } = params;

  if (!query) throw new Error("query parameter is required");
  if (!token) throw new Error("GITHUB_TOKEN environment variable not set");

  const q = encodeURIComponent(`${query} repo:${owner}/${repo} state:${state}`);
  const res = await fetch(`https://api.github.com/search/issues?q=${q}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    total: data.total_count,
    issues: data.items.map((i: any) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      url: i.html_url
    }))
  };
}

export async function run(input: SearchIssuesParams) {
  return await searchIssues(input);
}