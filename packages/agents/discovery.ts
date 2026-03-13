import registry from "../tools/registry.json";

// This gives the LLM the "Menu" of what it can delegate
export const toolDefinitions = registry.map(tool => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters // The JSON Schema we kept!
  }
}));

