import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Code, 
  FileCheck, 
  Bug, 
  TestTube2, 
  Play, 
  Check, 
  Copy, 
  ArrowRight,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { ProjectFile, AgentMode, AgentMessage, ExecutionPlan } from '../types';

interface AgentPanelProps {
  files: ProjectFile[];
  activeFile: ProjectFile | undefined;
  onApplyCodeToFile: (filePath: string, code: string) => void;
  onCreateNewFileWithCode: (filePath: string, code: string) => void;
  onAddTerminalLog: (text: string, type: 'info' | 'error' | 'success' | 'command') => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  files,
  activeFile,
  onApplyCodeToFile,
  onCreateNewFileWithCode,
  onAddTerminalLog,
}) => {
  const [mode, setMode] = useState<AgentMode>('agent');
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Welcome to Agent AI Code GPT
I am your autonomous engineering assistant powered by **Gemini 3.8 Flash**.

**What would you like to build or optimize today?**
- 🤖 **Autonomous Agent**: Provide a feature goal and I'll generate a step-by-step plan & files.
- 💬 **Code Assistant**: Chat and generate production-grade code.
- 🔍 **Review & Lint**: Deep code audit for performance & security.
- 🐞 **Debug**: Automatic root cause analysis and patch applicator.
- 🧪 **Unit Test**: Comprehensive test suites for any file.`,
      timestamp: 'Just now',
    },
  ]);

  const [currentPlan, setCurrentPlan] = useState<ExecutionPlan | null>(null);
  const [executingStepId, setExecutingStepId] = useState<number | null>(null);
  const [appliedSnippets, setAppliedSnippets] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, currentPlan]);

  // Extract code blocks from markdown: ```lang:filepath ... ``` or ```lang ... ```
  const extractCodeBlocks = (markdown: string) => {
    const regex = /```([a-zA-Z0-9_\-]+)?(?::([^\n]+))?\n([\s\S]*?)```/g;
    const blocks: { language: string; file: string; code: string }[] = [];
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        file: match[2]?.trim() || activeFile?.name || 'snippet.ts',
        code: match[3]?.trim() || '',
      });
    }
    return blocks;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || loading) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);
    onAddTerminalLog(`$ agent-ai execute --mode=${mode} "${promptToSend.slice(0, 30)}..."`, 'command');

    try {
      if (mode === 'agent') {
        // Generate structured multi-step plan
        const response = await fetch('/api/agent/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: promptToSend,
            projectFiles: files.map(f => ({ name: f.name, path: f.path, content: f.content })),
            activeFile: activeFile?.name,
          }),
        });

        const planData = await response.json();
        if (planData.steps) {
          setCurrentPlan({
            title: planData.title || `Plan: ${promptToSend}`,
            summary: planData.summary || 'Generated autonomous plan',
            steps: planData.steps.map((s: any) => ({ ...s, status: 'pending' })),
          });

          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `### 📋 Generated Autonomous Plan: ${planData.title || 'Feature Roadmap'}\n${planData.summary || ''}\n\nI have generated ${planData.steps.length} sequential execution steps. Review them below and click **"Execute Next Step"** or execute individual tasks.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          onAddTerminalLog(`[Agent AI] Decomposed goal into ${planData.steps.length} steps.`, 'success');
        }
      } else {
        // Standard Chat / Review / Debug / Test query
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
            projectFiles: files.map(f => ({ name: f.name, path: f.path, content: f.content })),
            activeFile: activeFile?.name,
            mode,
          }),
        });

        const data = await response.json();
        const replyText = data.reply || 'No response generated.';

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: data.model,
          },
        ]);
        onAddTerminalLog(`[Agent AI] Response received (${replyText.length} chars).`, 'info');
      }
    } catch (err: any) {
      console.error('[AgentPanel] Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Encountered an issue connecting to the Agent AI service: ${err.message || 'Network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      onAddTerminalLog(`[Agent AI] Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executePlanStep = async (stepId: number) => {
    if (!currentPlan) return;
    const step = currentPlan.steps.find(s => s.id === stepId);
    if (!step) return;

    setExecutingStepId(stepId);
    onAddTerminalLog(`[Agent AI] Executing step ${stepId}: ${step.title}...`, 'command');

    // Update step status to in-progress
    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map(s => s.id === stepId ? { ...s, status: 'in-progress' } : s),
      };
    });

    // Simulate agent synthesis and apply code
    setTimeout(() => {
      if (step.codeSnippet) {
        // If file exists, update it. If not, create it.
        const existing = files.find(f => f.name === step.targetFile || f.path === step.targetFile);
        if (existing) {
          onApplyCodeToFile(existing.path, step.codeSnippet);
        } else {
          onCreateNewFileWithCode(step.targetFile, step.codeSnippet);
        }
      }

      setCurrentPlan(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map(s => s.id === stepId ? { ...s, status: 'completed' } : s),
        };
      });

      onAddTerminalLog(`[Agent AI] Successfully executed: ${step.title} (${step.targetFile})`, 'success');
      setExecutingStepId(null);
    }, 900);
  };

  const handleApplySnippet = (snippetKey: string, filePath: string, code: string) => {
    const existing = files.find(f => f.name === filePath || f.path === filePath);
    if (existing) {
      onApplyCodeToFile(existing.path, code);
    } else {
      onCreateNewFileWithCode(filePath, code);
    }
    setAppliedSnippets(prev => ({ ...prev, [snippetKey]: true }));
    onAddTerminalLog(`[Agent AI] Applied patch to ${filePath}`, 'success');
    setTimeout(() => {
      setAppliedSnippets(prev => ({ ...prev, [snippetKey]: false }));
    }, 3000);
  };

  const quickPrompts = [
    { label: '🎨 Add Dark Theme Toggle', prompt: 'Add a dark/light mode toggle with smooth color transitions' },
    { label: '⚡ Optimize Performance', prompt: 'Analyze and optimize performance, debouncing events and memoizing' },
    { label: '💾 Add LocalStorage', prompt: 'Save state to window.localStorage so data persists across reloads' },
    { label: '🧪 Generate Unit Tests', prompt: 'Write comprehensive unit test cases for the active file' },
    { label: '🐞 Fix Potential Bugs', prompt: 'Scan active file for null pointers, memory leaks, and edge cases' },
  ];

  return (
    <div className="w-96 bg-[#161b22] border-l border-[#30363d] flex flex-col h-full select-none text-slate-200">
      {/* Agent Top Header */}
      <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Agent Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400">Context: {activeFile?.name || 'All Files'}</div>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: 'Chat history cleared. How can I assist your coding today?',
                timestamp: 'Now',
              },
            ]);
            setCurrentPlan(null);
          }}
          className="p-1 hover:bg-[#21262d] rounded text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-5 p-1 bg-[#0d1117] border-b border-[#30363d] text-[11px] font-medium text-slate-400">
        <button
          onClick={() => setMode('agent')}
          className={`py-1.5 rounded transition cursor-pointer flex flex-col items-center gap-1 ${
            mode === 'agent' ? 'bg-[#21262d] text-indigo-400 font-semibold shadow' : 'hover:text-slate-200'
          }`}
          title="Autonomous Multi-Step Agent"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Agent</span>
        </button>
        <button
          onClick={() => setMode('chat')}
          className={`py-1.5 rounded transition cursor-pointer flex flex-col items-center gap-1 ${
            mode === 'chat' ? 'bg-[#21262d] text-indigo-400 font-semibold shadow' : 'hover:text-slate-200'
          }`}
          title="Pair Programmer Chat"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setMode('review')}
          className={`py-1.5 rounded transition cursor-pointer flex flex-col items-center gap-1 ${
            mode === 'review' ? 'bg-[#21262d] text-indigo-400 font-semibold shadow' : 'hover:text-slate-200'
          }`}
          title="Code Review & Quality Audit"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>
        <button
          onClick={() => setMode('debug')}
          className={`py-1.5 rounded transition cursor-pointer flex flex-col items-center gap-1 ${
            mode === 'debug' ? 'bg-[#21262d] text-indigo-400 font-semibold shadow' : 'hover:text-slate-200'
          }`}
          title="Bug Diagnostics"
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Debug</span>
        </button>
        <button
          onClick={() => setMode('test')}
          className={`py-1.5 rounded transition cursor-pointer flex flex-col items-center gap-1 ${
            mode === 'test' ? 'bg-[#21262d] text-indigo-400 font-semibold shadow' : 'hover:text-slate-200'
          }`}
          title="Generate Test Suite"
        >
          <TestTube2 className="w-3.5 h-3.5" />
          <span>Test</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const codeBlocks = !isUser ? extractCodeBlocks(msg.content) : [];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                <span>{isUser ? 'You' : 'Agent AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.model && (
                  <span className="text-indigo-400 bg-indigo-500/10 px-1 rounded">
                    {msg.model}
                  </span>
                )}
              </div>

              <div
                className={`max-w-[95%] p-3 rounded-xl border leading-relaxed select-text ${
                  isUser
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#0d1117] text-slate-200 border-[#30363d]'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Detected Code Blocks with 1-Click Action Buttons */}
                {codeBlocks.length > 0 && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-[#30363d]">
                    <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" />
                      <span>Code Changes Generated:</span>
                    </div>

                    {codeBlocks.map((block, idx) => {
                      const snippetKey = `${msg.id}-${idx}`;
                      const isApplied = appliedSnippets[snippetKey];

                      return (
                        <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                          <div className="px-2.5 py-1.5 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-300 font-semibold truncate">
                              {block.file}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => navigator.clipboard.writeText(block.code)}
                                className="p-1 hover:text-white text-slate-400 transition"
                                title="Copy code"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <pre className="p-2.5 text-[11px] font-mono overflow-x-auto max-h-40 bg-[#0d1117] text-indigo-200 leading-tight">
                            {block.code}
                          </pre>

                          <div className="p-2 bg-[#161b22] border-t border-[#30363d] flex justify-end">
                            <button
                              onClick={() => handleApplySnippet(snippetKey, block.file, block.code)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Applied!</span>
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Apply to Project</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Autonomous Execution Plan Card */}
        {currentPlan && (
          <div className="p-3 bg-[#0d1117] border border-indigo-500/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Layers className="w-4 h-4" />
                <span>{currentPlan.title}</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {currentPlan.steps.filter(s => s.status === 'completed').length}/{currentPlan.steps.length} Done
              </span>
            </div>

            <p className="text-[11px] text-slate-400">{currentPlan.summary}</p>

            <div className="space-y-2 pt-1">
              {currentPlan.steps.map((step) => {
                const isStepExecuting = executingStepId === step.id;
                const isCompleted = step.status === 'completed';

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-lg border text-[11px] flex items-start justify-between gap-2 transition ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : isStepExecuting
                        ? 'bg-indigo-950/30 border-indigo-500 text-indigo-200'
                        : 'bg-[#161b22] border-[#30363d] text-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isStepExecuting ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-700 text-slate-300 text-[9px] flex items-center justify-center shrink-0">
                            {step.id}
                          </span>
                        )}
                        <span>{step.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{step.description}</p>
                      <div className="mt-1 text-[10px] font-mono text-slate-500">
                        Target: <span className="text-slate-300">{step.targetFile}</span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => executePlanStep(step.id)}
                        disabled={isStepExecuting}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Run</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Agent AI is synthesizing code with Gemini 3.8 Flash...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2 border-t border-[#30363d] bg-[#0d1117]/60 overflow-x-auto whitespace-nowrap space-x-1.5 flex select-none">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2.5 py-1 rounded-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[11px] text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#30363d] bg-[#161b22]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              mode === 'agent'
                ? 'Describe the feature you want the agent to build...'
                : mode === 'review'
                ? 'Ask for a review or click send to audit active file...'
                : mode === 'debug'
                ? 'Describe bug or ask to inspect active code...'
                : mode === 'test'
                ? 'Ask for unit tests for current file...'
                : 'Ask a coding question or request refactoring...'
            }
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition shadow-md shadow-indigo-900/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Press Enter to prompt Agent AI</span>
          <span>Powered by Gemini</span>
        </div>
      </div>
    </div>
  );
};
