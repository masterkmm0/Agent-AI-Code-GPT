import React, { useRef, useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  FileCode, 
  Search, 
  X, 
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { ProjectFile } from '../types';

interface CodeEditorProps {
  activeFile: ProjectFile | undefined;
  openFiles: ProjectFile[];
  onSelectFile: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onChangeContent: (fileId: string, newContent: string) => void;
  onAskAgentAboutCode: (codeSelection: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  openFiles,
  onSelectFile,
  onCloseTab,
  onChangeContent,
  onAskAgentAboutCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const content = activeFile?.content || '';
  const lines = content.split('\n');

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Tab key for clean 2-space indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      if (activeFile) {
        onChangeContent(activeFile.id, newContent);
      }

      // Restore cursor position after state updates
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleAskSelection = () => {
    if (!textareaRef.current) return;
    const selected = textareaRef.current.value.substring(
      textareaRef.current.selectionStart,
      textareaRef.current.selectionEnd
    );
    if (selected.trim()) {
      onAskAgentAboutCode(selected);
    } else {
      onAskAgentAboutCode(content);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#0d1117] flex items-center justify-center text-slate-500">
        <p className="text-sm">No file currently selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0d1117] flex flex-col h-full overflow-hidden border-r border-[#30363d]">
      {/* Tab Bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-2 overflow-x-auto select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          {openFiles.map((file) => {
            const isActive = file.id === activeFile.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t text-xs cursor-pointer border-t-2 transition ${
                  isActive
                    ? 'bg-[#0d1117] text-white border-indigo-500 font-medium'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#21262d]'
                }`}
              >
                <span>{file.name}</span>
                {openFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#30363d] rounded text-slate-400 hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor Top Bar Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              showSearch ? 'bg-[#30363d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Search inside file"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAskSelection}
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
            title="Send active code or selection to Agent AI"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Ask AI Agent</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#21262d] transition cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search in active document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <span className="text-[11px] text-slate-400">
              Matches: {content.split(searchTerm).length - 1}
            </span>
          )}
        </div>
      )}

      {/* Editor Body: Line numbers + Textarea */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-sm leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-[#0d1117] border-r border-[#30363d] py-3 pr-3 text-right select-none text-slate-600 text-xs overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChangeContent(activeFile.id, e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-200 p-3 outline-none resize-none overflow-y-auto leading-6 whitespace-pre font-mono selection:bg-indigo-600/40"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#161b22] border-t border-[#30363d] px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span>{activeFile.path}</span>
          <span className="text-slate-600">•</span>
          <span>{lines.length} lines</span>
          <span className="text-slate-600">•</span>
          <span>{content.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase text-slate-500">{activeFile.language}</span>
          <span className="text-slate-600">•</span>
          <span>UTF-8</span>
          <span className="text-slate-600">•</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
