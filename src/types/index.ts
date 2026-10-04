export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified?: boolean;
}

export interface SuggestedChange {
  file: string;
  code: string;
  type: 'create' | 'modify';
  description?: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  suggestedChanges?: SuggestedChange[];
  isThinking?: boolean;
}

export type AgentMode = 'agent' | 'chat' | 'review' | 'debug' | 'test';

export interface PlanStep {
  id: number;
  title: string;
  description: string;
  action: 'create' | 'modify' | 'test' | 'review';
  targetFile: string;
  codeSnippet?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ExecutionPlan {
  title: string;
  summary: string;
  steps: PlanStep[];
}

export interface TerminalLog {
  id: string;
  text: string;
  type: 'info' | 'error' | 'success' | 'command' | 'preview';
  timestamp: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  files: ProjectFile[];
}
