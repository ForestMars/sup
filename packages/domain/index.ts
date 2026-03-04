// packages/domain/index.ts
// Define the output contract
export interface OutputPort {
  write(text: string): Promise<void>;
}

export * from "@sup/types"; // (was: agent-types";)
// export * from "./models/session"; // Wherever AgentConfig/AgentSession live ummm
