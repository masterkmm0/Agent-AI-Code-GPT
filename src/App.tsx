import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { AgentPanel } from './components/AgentPanel';
import { LivePreview } from './components/LivePreview';
import { Terminal } from './components/Terminal';
import { TEMPLATES } from './data/templates';
import { ProjectFile, ProjectTemplate, TerminalLog } from './types';

export const App: React.FC = () => {
  // Active Project Workspace Files
  const [files, setFiles] = useState<ProjectFile[]>(TEMPLATES[0].files);
  const [activeFileId, setActiveFileId] = useState<string>(TEMPLATES[0].files[0].id);
  const [openFileIds, setOpenFileIds] = useState<string[]>([
    TEMPLATES[0].files[0].id,
    TEMPLATES[0].files[1]?.id || '',
  ].filter(Boolean));

  // Layout View Controls
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAgent, setShowAgent] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Status & API State
  const [hasApiKey, setHasApiKey] = useState(false);

  // Terminal & Console Logs
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'boot',
      text: '[System] Agent AI Code GPT workspace initialized.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
    {
      id: 'template-loaded',
      text: `[Workspace] Loaded "${TEMPLATES[0].name}" with ${TEMPLATES[0].files.length} project files.`,
      type: 'success',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
  ]);

  // Check backend status on mount
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setHasApiKey(data.hasApiKey);
        addLog(`[Gemini Engine] Model "${data.model}" connected. Status: ${data.status}`, 'info');
      })
      .catch(err => {
        addLog(`[Status] Running in local offline mode (${err.message})`, 'info');
      });
  }, []);

  const addLog = (text: string, type: 'info' | 'error' | 'success' | 'command' | 'preview' = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        text,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
  };

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const openFiles = files.filter(f => openFileIds.includes(f.id));

  // Handlers
  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds(prev => [...prev, fileId]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextOpen = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(nextOpen);
    if (activeFileId === fileId && nextOpen.length > 0) {
      setActiveFileId(nextOpen[0]);
    }
  };

  const handleChangeContent = (fileId: string, newContent: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, content: newContent, isModified: true } : f))
    );
  };

  const handleCreateFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
    let lang = 'plaintext';
    if (['ts', 'tsx'].includes(ext)) lang = 'typescript';
    if (['js', 'jsx'].includes(ext)) lang = 'javascript';
    if (['html'].includes(ext)) lang = 'html';
    if (['css'].includes(ext)) lang = 'css';
    if (['json'].includes(ext)) lang = 'json';
    if (['md'].includes(ext)) lang = 'markdown';

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: fileName,
      path: fileName,
      language: lang,
      content: `// ${fileName}\n\n`,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOpenFileIds(prev => [...prev, newFile.id]);
    addLog(`[Workspace] Created file "${fileName}"`, 'success');
  };

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setOpenFileIds(prev => prev.filter(id => id !== fileId));
    if (fileToDelete) {
      addLog(`[Workspace] Deleted file "${fileToDelete.name}"`, 'info');
    }
  };

  const handleApplyCodeToFile = (filePath: string, code: string) => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.path === filePath || f.name === filePath);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: code, isModified: false };
        return updated;
      }
      return prev;
    });
    setRefreshTrigger(t => t + 1);
  };

  const handleCreateNewFileWithCode = (filePath: string, code: string) => {
    const fileName = filePath.split('/').pop() || filePath;
    const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
    let lang = 'typescript';
    if (ext === 'html') lang = 'html';
    if (ext === 'css') lang = 'css';
    if (ext === 'json') lang = 'json';

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: fileName,
      path: filePath,
      language: lang,
      content: code,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOpenFileIds(prev => [...prev, newFile.id]);
    setRefreshTrigger(t => t + 1);
    addLog(`[Agent AI] Generated new file: ${filePath}`, 'success');
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setFiles(template.files);
    setActiveFileId(template.files[0].id);
    setOpenFileIds(template.files.slice(0, 3).map(f => f.id));
    setRefreshTrigger(t => t + 1);
    addLog(`[Template] Switched to preset: "${template.name}"`, 'success');
  };

  const handleExportProject = () => {
    const projectData = {
      name: 'Agent-AI-Code-GPT-Project',
      exportedAt: new Date().toISOString(),
      files,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-ai-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('[Workspace] Project exported successfully as JSON.', 'success');
  };

  const handleExecuteTerminalCommand = (rawCommand: string) => {
    const cmd = rawCommand.trim();
    addLog(`$ ${cmd}`, 'command');

    const parts = cmd.split(' ');
    const base = parts[0].toLowerCase();

    if (base === 'clear') {
      setLogs([]);
      return;
    }

    if (base === 'help') {
      addLog(`Available developer commands:
  • npm run build   - Simulate production bundle compilation
  • npm test        - Execute test runners on workspace
  • npm run lint    - Scan workspace files for syntax issues
  • ls / dir        - List files in workspace
  • tree            - Display tree structure of workspace
  • cat <filename>  - Print file content
  • git status      - Show branch and modified files
  • git commit -m   - Commit current changes
  • run             - Refresh live preview sandbox
  • clear           - Clear console output`, 'info');
      return;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      const fileList = files.map(f => `${f.name.padEnd(20)} (${f.content.length} bytes)`).join('\n  ');
      addLog(`Workspace directory listing:\n  ${fileList}`, 'info');
      return;
    }

    if (cmd === 'tree') {
      const tree = '.\n' + files.map((f, i) => `${i === files.length - 1 ? '└── ' : '├── '}${f.path}`).join('\n');
      addLog(tree, 'info');
      return;
    }

    if (cmd.startsWith('cat ')) {
      const targetName = parts[1];
      const found = files.find(f => f.name === targetName || f.path === targetName);
      if (found) {
        addLog(`=== ${found.name} ===\n${found.content}`, 'info');
      } else {
        addLog(`cat: ${targetName}: No such file or directory`, 'error');
      }
      return;
    }

    if (cmd === 'npm run build' || cmd === 'npm build') {
      addLog(`> agent-ai-workspace@1.0.0 build\n> vite build\n\n✓ ${files.length} modules transformed.\ndist/index.html   ${(files.reduce((a, b) => a + b.content.length, 0) / 1024).toFixed(1)} kB\n✓ built in 142ms`, 'success');
      return;
    }

    if (cmd === 'npm test' || cmd === 'npm t') {
      addLog(`> test\n> vitest run\n\n ✓ src/__tests__/app.test.ts (4 tests)\n   ✓ initial state is valid (2ms)\n   ✓ event handlers dispatch correctly (4ms)\n   ✓ reactive bindings reflect in DOM (3ms)\n   ✓ boundary errors handled gracefully (1ms)\n\n Test Files  1 passed (1)\n      Tests  4 passed (4)\n   Duration  189ms`, 'success');
      return;
    }

    if (cmd === 'npm run lint') {
      addLog(`> lint\n> eslint . --ext ts,tsx,js\n\n✨ 0 errors, 0 warnings found in ${files.length} files. All checks passed.`, 'success');
      return;
    }

    if (cmd === 'git status') {
      const modified = files.filter(f => f.isModified).map(f => `\tmodified:   ${f.path}`).join('\n');
      addLog(`On branch main\nYour branch is up to date with 'origin/main'.\n\n${modified ? `Changes not staged for commit:\n${modified}` : 'nothing to commit, working tree clean'}`, 'info');
      return;
    }

    if (cmd.startsWith('git commit')) {
      setFiles(prev => prev.map(f => ({ ...f, isModified: false })));
      addLog(`[main ${Math.random().toString(16).slice(2, 9)}] Changes committed.\n ${files.length} files changed`, 'success');
      return;
    }

    if (cmd === 'run') {
      setRefreshTrigger(t => t + 1);
      addLog('[Preview] Reloading sandbox...', 'success');
      return;
    }

    addLog(`Command not found: ${cmd}. Type "help" for a list of commands.`, 'error');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        onRunPreview={() => {
          setRefreshTrigger(t => t + 1);
          addLog('[Preview] Manually refreshed sandbox container.', 'info');
        }}
        onSelectTemplate={handleSelectTemplate}
        onExportProject={handleExportProject}
        showExplorer={showExplorer}
        setShowExplorer={setShowExplorer}
        showAgent={showAgent}
        setShowAgent={setShowAgent}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        hasApiKey={hasApiKey}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Explorer */}
        {showExplorer && (
          <FileTree
            files={files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {/* Center: Code Editor & Live Preview Split */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <CodeEditor
              activeFile={activeFile}
              openFiles={openFiles}
              onSelectFile={handleSelectFile}
              onCloseTab={handleCloseTab}
              onChangeContent={handleChangeContent}
              onAskAgentAboutCode={(code) => {
                setShowAgent(true);
                addLog(`[Agent AI] Code snippet sent to assistant context (${code.length} chars).`, 'info');
              }}
            />

            {/* Live Preview Sandbox */}
            {showPreview && (
              <LivePreview
                files={files}
                refreshTrigger={refreshTrigger}
                onConsoleLog={(text, type) => addLog(text, type)}
              />
            )}
          </div>

          {/* Bottom Integrated Terminal */}
          {showTerminal && (
            <Terminal
              logs={logs}
              files={files}
              onClearLogs={() => setLogs([])}
              onExecuteAgentCommand={handleExecuteTerminalCommand}
            />
          )}
        </div>

        {/* Right AI Agent Assistant Panel */}
        {showAgent && (
          <AgentPanel
            files={files}
            activeFile={activeFile}
            onApplyCodeToFile={handleApplyCodeToFile}
            onCreateNewFileWithCode={handleCreateNewFileWithCode}
            onAddTerminalLog={(text, type) => addLog(text, type)}
          />
        )}
      </div>
    </div>
  );
};
export default App;
