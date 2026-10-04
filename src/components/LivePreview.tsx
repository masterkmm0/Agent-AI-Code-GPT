import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  RotateCw, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ProjectFile } from '../types';

interface LivePreviewProps {
  files: ProjectFile[];
  onConsoleLog: (text: string, type: 'info' | 'error' | 'success') => void;
  refreshTrigger: number;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  onConsoleLog,
  refreshTrigger,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compile project files into a sandboxed HTML bundle
  const compileProject = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html')) || files[0];
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts'));

    let htmlContent = htmlFile?.content || '<html><body><p>No HTML file found.</p></body></html>';

    // Inject console interceptor script
    const consoleInterceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;

          function sendToParent(type, args) {
            try {
              const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
              window.parent.postMessage({ type: 'PREVIEW_CONSOLE', logType: type, message: msg }, '*');
            } catch(e) {}
          }

          console.log = function() {
            sendToParent('info', arguments);
            originalLog.apply(console, arguments);
          };
          console.warn = function() {
            sendToParent('error', arguments);
            originalWarn.apply(console, arguments);
          };
          console.error = function() {
            sendToParent('error', arguments);
            originalError.apply(console, arguments);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            sendToParent('error', ['[Runtime Error]', message, 'at line', lineno]);
          };
        })();
      </script>
    `;

    // Combine styles
    let combinedStyles = '';
    cssFiles.forEach(css => {
      combinedStyles += `<style>/* ${css.name} */\n${css.content}</style>\n`;
    });

    // Combine scripts
    let combinedScripts = '';
    jsFiles.forEach(js => {
      // Basic transpilation / wrap if needed
      combinedScripts += `<script>/* ${js.name} */\ntry {\n${js.content}\n} catch(err) { console.error('[Script error in ${js.name}]:', err.message); }</script>\n`;
    });

    // Replace external references with inlined code if matching
    let finalDoc = htmlContent;
    
    // Remove references to script.js and styles.css since we inline them directly
    finalDoc = finalDoc.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](styles\.css|style\.css)["'][^>]*>/gi, '');
    finalDoc = finalDoc.replace(/<script[^>]*src=["'](script\.js|app\.js|main\.js|game\.js)["'][^>]*><\/script>/gi, '');

    // Insert into head or body
    if (finalDoc.includes('</head>')) {
      finalDoc = finalDoc.replace('</head>', `${consoleInterceptor}${combinedStyles}</head>`);
    } else {
      finalDoc = `${consoleInterceptor}${combinedStyles}` + finalDoc;
    }

    if (finalDoc.includes('</body>')) {
      finalDoc = finalDoc.replace('</body>', `${combinedScripts}</body>`);
    } else {
      finalDoc = finalDoc + combinedScripts;
    }

    return finalDoc;
  };

  const reloadIframe = () => {
    if (!iframeRef.current) return;
    const doc = compileProject();
    iframeRef.current.srcdoc = doc;
    onConsoleLog('[Sandbox] Recompiled and reloaded preview sandbox.', 'info');
  };

  useEffect(() => {
    reloadIframe();
  }, [files, refreshTrigger]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_CONSOLE') {
        onConsoleLog(`[App Log] ${event.data.message}`, event.data.logType || 'info');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex-1 bg-[#090d16] flex flex-col h-full overflow-hidden select-none">
      {/* Top Preview Bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Sandbox Live View
          </span>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded text-xs transition cursor-pointer ${
              deviceMode === 'desktop' ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop 100%"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded text-xs transition cursor-pointer ${
              deviceMode === 'tablet' ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet 768px"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded text-xs transition cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-[#21262d] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile 375px"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reload button */}
        <div className="flex items-center gap-1">
          <button
            onClick={reloadIframe}
            className="p-1.5 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-100 transition cursor-pointer"
            title="Reload Sandbox"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-[#090d16]">
        <div
          className={`${getContainerWidth()} h-full transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-[#30363d] bg-white flex flex-col`}
        >
          <iframe
            ref={iframeRef}
            title="Workspace Sandbox Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-0 bg-transparent flex-1"
          />
        </div>
      </div>
    </div>
  );
};
