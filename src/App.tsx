/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderLock, 
  FileCode2, 
  FileText, 
  PanelLeft, 
  Copy, 
  CheckCircle2, 
  TerminalSquare 
} from 'lucide-react';
import { pythonSolutionFiles } from './data/files';

export default function App() {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeFile = pythonSolutionFiles[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case 'python': return <FileCode2 className="w-4 h-4 text-[#888]" />;
      case 'markdown': return <FileText className="w-4 h-4 text-[#888]" />;
      default: return <FileText className="w-4 h-4 text-[#555]" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-[#E5E5E5] font-sans overflow-hidden border-8 border-[#1A1A1C]">
      {/* Sidebar Explorer */}
      <aside 
        className={`${sidebarOpen ? 'w-80' : 'w-0'} flex flex-col border-r border-[#2D2D30] bg-[#0F0F11] transition-all duration-300 overflow-hidden shrink-0`}
      >
        <div className="flex items-center space-x-2 p-8 text-[11px] uppercase tracking-[0.3em] font-semibold border-b border-[#2D2D30] shrink-0 text-[#888]">
          <TerminalSquare className="w-4 h-4" />
          <span>Project Structure</span>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto py-8 px-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#888] mb-6 border-b border-[#2D2D30] pb-2 flex items-center space-x-2">
            <FolderLock className="w-3 h-3" />
            <span>trading_bot</span>
          </div>
          
          <ul className="font-mono text-[13px] space-y-3 text-[#B0B0B5]">
            {pythonSolutionFiles.map((file, index) => (
              <li key={index}>
                <button
                  onClick={() => setActiveFileIndex(index)}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 text-left transition-colors
                    ${activeFileIndex === index 
                      ? 'text-white border-l-2 border-emerald-500 bg-[#111]' 
                      : 'text-[#888] hover:text-[#B0B0B5] border-l-2 border-transparent hover:border-[#333]'
                    }`}
                >
                  {getFileIcon(file.language)}
                  <span className="truncate">{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B]">
        {/* Editor Toolbar */}
        <header className="flex items-center justify-between p-8 border-b border-[#2D2D30] bg-[#0A0A0B]">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-[#888] hover:text-white transition-colors"
              title="Toggle Explorer"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#888] mb-1">Active File</span>
              <div className="flex items-center space-x-2 font-serif italic text-white text-3xl leading-none">
                <span>{activeFile.name}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-6 py-3 border border-[#2D2D30] text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </header>

        {/* Code View Canvas */}
        <div className="flex-1 p-8 bg-black overflow-hidden relative flex flex-col border-t border-[#2D2D30] mt-[-1px]">
          <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4 flex-shrink-0 z-10 w-full bg-black">
             <span className="text-[11px] text-[#555] uppercase tracking-widest">Execution Terminal / Editor</span>
             <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>
             </div>
          </div>
          <div className="flex-1 overflow-auto z-10 w-full h-full">
            <pre className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words text-[#B0B0B5]">
              <code>
                {activeFile.content}
              </code>
            </pre>
          </div>
          <div className="absolute bottom-8 right-8 text-[80px] font-serif italic text-white opacity-[0.03] select-none pointer-events-none">
            SHELL
          </div>
        </div>
      </main>
    </div>
  );
}
