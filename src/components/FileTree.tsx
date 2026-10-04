import React, { useState } from 'react';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Plus, 
  Trash2, 
  File, 
  ChevronRight, 
  Folder,
  Code
} from 'lucide-react';
import { ProjectFile } from '../types';

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'css':
        return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'js':
      case 'javascript':
        return <Code className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'md':
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-60 bg-[#161b22] border-r border-[#30363d] flex flex-col h-full select-none text-slate-300">
      {/* Explorer Header */}
      <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Folder className="w-4 h-4 text-indigo-400" />
          <span>Explorer</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-100 transition cursor-pointer"
          title="New File"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace Directory Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          <span>Workspace Files ({files.length})</span>
        </div>

        {/* New File Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-2 py-1">
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. style.css, App.tsx"
              onBlur={() => {
                if (!newFileName.trim()) setIsCreating(false);
              }}
              className="w-full bg-[#0d1117] border border-indigo-500 text-xs px-2 py-1 rounded text-white focus:outline-none"
            />
          </form>
        )}

        {/* File items */}
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500'
                  : 'hover:bg-[#21262d] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(file.name)}
                <span className="truncate">{file.name}</span>
                {file.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
                )}
              </div>

              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${file.name}?`)) {
                      onDeleteFile(file.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 rounded transition cursor-pointer"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Explorer Footer info */}
      <div className="p-3 border-t border-[#30363d] bg-[#0d1117] text-[11px] text-slate-500 flex justify-between items-center">
        <span>Root: /workspace</span>
        <span className="text-emerald-400">Ready</span>
      </div>
    </div>
  );
};
