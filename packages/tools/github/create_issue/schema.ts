export const schema = {
  name: "create_issue",
  description: "Create a GitHub issue in a repository",
  parameters: {
    type: "object",
    properties: {
      repo: {
        type: "string",
        description: "Repository in the format owner/repo"
      },
      title: {
        type: "string",
        description: "Issue title"
      },
      body: {
        type: "string",
        description: "Issue description"
      },
      labels: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Labels to apply"
      }
    },
    required: ["repo", "title"]
  }
};