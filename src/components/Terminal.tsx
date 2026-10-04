import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Maximize2,
  Minimize2,
  Copy
} from 'lucide-react';
import { TerminalLog, ProjectFile } from '../types';

interface TerminalProps {
  logs: TerminalLog[];
  files: ProjectFile[];
  onClearLogs: () => void;
  onExecuteAgentCommand: (command: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  logs,
  files,
  onClearLogs,
  onExecuteAgentCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'console' | 'problems'>('terminal');
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    // Handle command
    onExecuteAgentCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCommandInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'console') {
      return log.text.startsWith('[App Log]') || log.type === 'preview';
    }
    if (activeTab === 'problems') {
      return log.type === 'error' || log.text.toLowerCase().includes('error');
    }
    return true;
  });

  return (
    <div className="h-48 bg-[#0d1117] border-t border-[#30363d] flex flex-col font-mono text-xs select-none">
      {/* Terminal Tab Bar */}
      <div className="h-8 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terminal' ? 'bg-[#21262d] text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'console' ? 'bg-[#21262d] text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>App Console</span>
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'problems' ? 'bg-[#21262d] text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Problems ({logs.filter(l => l.type === 'error').length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="p-1 hover:bg-[#21262d] rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Logs Output */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic">No output. Type `help` or prompt the AI Agent to run tasks.</div>
        ) : (
          filteredLogs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.type === 'command') textColor = 'text-cyan-400 font-semibold';
            if (log.type === 'error') textColor = 'text-rose-400';
            if (log.type === 'success') textColor = 'text-emerald-400';
            if (log.type === 'info') textColor = 'text-indigo-300';

            return (
              <div key={log.id} className={`flex items-start gap-2 leading-relaxed ${textColor}`}>
                <span className="text-[10px] text-slate-600 select-none shrink-0 pt-0.5">
                  {log.timestamp}
                </span>
                <span className="break-all whitespace-pre-wrap">{log.text}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command Input Form */}
      {activeTab === 'terminal' && (
        <form
          onSubmit={handleCommandSubmit}
          className="h-8 bg-[#161b22] border-t border-[#30363d] px-3 flex items-center gap-2"
        >
          <span className="text-indigo-400 font-bold select-none">➜</span>
          <span className="text-slate-500 text-[11px] select-none">workspace</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try: npm test, npm run build, ls, git status, tree, help..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </form>
      )}
    </div>
  );
};
