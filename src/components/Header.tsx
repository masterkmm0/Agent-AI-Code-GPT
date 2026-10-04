import React from 'react';
import { 
  Bot, 
  Play, 
  Download, 
  Sparkles, 
  Code2, 
  Terminal as TerminalIcon, 
  Layout, 
  FolderTree, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { ProjectTemplate } from '../types';

interface HeaderProps {
  onRunPreview: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
  onExportProject: () => void;
  showExplorer: boolean;
  setShowExplorer: (val: boolean) => void;
  showAgent: boolean;
  setShowAgent: (val: boolean) => void;
  showPreview: boolean;
  setShowPreview: (val: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (val: boolean) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRunPreview,
  onSelectTemplate,
  onExportProject,
  showExplorer,
  setShowExplorer,
  showAgent,
  setShowAgent,
  showPreview,
  setShowPreview,
  showTerminal,
  setShowTerminal,
  hasApiKey,
}) => {
  return (
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Agent AI Code GPT
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none mt-0.5">
            Autonomous Multi-Agent Workspace
          </p>
        </div>
      </div>

      {/* Middle: Quick Project Templates & Run */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            Preset:
          </span>
          <select 
            onChange={(e) => {
              const tmpl = TEMPLATES.find(t => t.id === e.target.value);
              if (tmpl) onSelectTemplate(tmpl);
            }}
            className="bg-transparent text-xs text-slate-200 py-1 pr-3 focus:outline-none cursor-pointer"
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id} className="bg-[#161b22] text-slate-200">
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRunPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition cursor-pointer"
          title="Execute code in live preview container"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Sandbox</span>
        </button>
      </div>

      {/* Right: Layout Panel Toggles & Export */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg p-1">
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              showExplorer ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle File Explorer"
          >
            <FolderTree className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              showPreview ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Live Preview Sandbox"
          >
            <Layout className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              showTerminal ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Terminal Console"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAgent(!showAgent)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              showAgent ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Agent AI Code Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onExportProject}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-medium transition cursor-pointer"
          title="Export Workspace Files as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
