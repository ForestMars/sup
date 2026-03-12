// packages/tools/github/create_issue/index.ts
import fetch from "node-fetch"; // or global fetch if using Node 18+

export interface CreateIssueParams {
  repo: string;      // e.g., "ForestMars/sup"
  title: string;
  body?: string;
  labels?: string[];
}

export async function run({ repo, title, body, labels = [] }: CreateIssueParams) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_TOKEN environment variable");
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub issue creation failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { url: data.html_url };
}