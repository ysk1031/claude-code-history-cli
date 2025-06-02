export interface ClaudeMessage {
  parentUuid: string | null;
  isSidechain: boolean;
  userType: string;
  cwd: string;
  sessionId: string;
  version: string;
  type: "user" | "assistant";
  message: {
    role: "user" | "assistant";
    content: string | Array<{
      type: string;
      text?: string;
      tool_use_id?: string;
      id?: string;
      name?: string;
      input?: any;
    }>;
    id?: string;
    model?: string;
    stop_reason?: string;
    usage?: any;
  };
  isMeta?: boolean;
  uuid: string;
  timestamp: string;
  costUSD?: number;
  durationMs?: number;
  toolUseResult?: any;
}

export interface Session {
  id: string;
  projectPath: string;
  messages: ClaudeMessage[];
  startTime: Date;
  endTime: Date;
}