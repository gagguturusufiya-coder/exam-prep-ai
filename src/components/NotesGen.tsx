import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, AlertCircle, RefreshCw, Printer, Copy, Check, CheckCircle, Download, FilePlus } from 'lucide-react';

interface NotesGenProps {
  token?: string;
  onBookmarkSaved?: (type: string, title: string, content: any) => void;
}

export default function NotesGen({ token, onBookmarkSaved }: NotesGenProps) {
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [customText, setCustomText] = useState('');
  const [format, setFormat] = useState<'detailed' | 'short' | 'bullet' | 'cheatsheet'>('detailed');
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !customText.trim()) return;

    setLoading(true);
    setGeneratedNotes(null);
    setBookmarked(false);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic,
          chapter,
          format,
          customContent: customText
        })
      });
      const data = await response.json();
      setGeneratedNotes(data.notes);

      if (token && data?.notes) {
        // Log generated notes to study history
        fetch('/api/history/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'note',
            title: `AI Notes: ${topic || 'Custom Notes'}`,
            query: topic || customText,
            content: data.notes
          })
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('Notes generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveBookmark = () => {
    if (onBookmarkSaved && generatedNotes) {
      onBookmarkSaved('note', `AI Notes: ${topic || 'Custom File'}`, generatedNotes);
      setBookmarked(true);
    }
  };

  // Simple, robust zero-dependency markdown parser to convert MD syntax into styled JSX safely
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-3 font-sans border-b border-slate-900 pb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold text-indigo-300 mt-5 mb-2 font-sans">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-indigo-400 mt-4 mb-2 font-sans">{line.replace('### ', '')}</h3>;
      }
      // Bullets
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="text-slate-300 text-sm leading-relaxed ml-6 list-disc mt-1">
            {line.substring(2)}
          </li>
        );
      }
      // Code blocks / formulas
      if (line.startsWith('$$') || line.startsWith('`')) {
        return (
          <pre key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-indigo-300 text-xs overflow-x-auto my-3">
            {line.replace(/\$\$|`/g, '')}
          </pre>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard line
      return (
        <p key={idx} className="text-slate-300 text-sm leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6" id="notes_gen_module_root">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" /> AI Notes Generator
        </h2>
        <p className="text-slate-400 text-xs">Instantly draft comprehensive, classroom-ready exam notes, summaries, or quick cheat sheets.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6" id="notes_gen_content">
        
        {/* CONTROL CONFIG PANEL */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-4 h-fit" id="notes_controls_card">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Configure Syllabus
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Syllabus Topic</label>
              <input 
                type="text"
                placeholder="e.g., 'LRU Memory Management'"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                id="notes_topic_input"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Chapter / Subject</label>
              <input 
                type="text"
                placeholder="e.g., 'Operating Systems'"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                id="notes_chapter_input"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Paste Notebook text (Optional)</label>
              <textarea 
                placeholder="Paste handwritten draft text, PDF copy-pastes, whiteboard notes, or books details here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl p-4 text-xs font-sans resize-none"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                id="notes_textarea_input"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Generative Output Format</label>
              <div className="grid grid-cols-2 gap-2" id="format_picker">
                {[
                  { id: 'detailed', label: 'Detailed Book' },
                  { id: 'short', label: 'Short Notes' },
                  { id: 'bullet', label: 'High Yield Bullets' },
                  { id: 'cheatsheet', label: 'Formula Cheat Sheet' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id as any)}
                    className={`p-2.5 rounded-lg border text-[11px] text-center font-medium cursor-pointer transition-colors ${format === opt.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400'}`}
                    id={`notes_format_btn_${opt.id}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!topic.trim() && !customText.trim())}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
              id="notes_generate_btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Master Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Study Notes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* OUTPUT DISPLAY PANEL */}
        <div className="md:col-span-2 space-y-4" id="notes_display_panel">
          {generatedNotes ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-6" id="generated_notes_container">
              
              {/* UTILITY CONTROL BAR */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4" id="notes_utility_bar">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                  <span>AI NOTES GENERATED SUCCESSFULLY</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveBookmark}
                    disabled={bookmarked}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* RENDERED NOTE CONTENT */}
              <div className="prose max-w-none text-slate-100 font-sans leading-relaxed select-text" id="rendered_markdown_box">
                {renderMarkdown(generatedNotes)}
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/20 border border-dashed border-slate-900 text-center space-y-4" id="empty_notes_container">
              <FilePlus className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Generate Your Study Companion</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">Fill the parameters on the left to synthesize deep cognitive notes. Your results will print cleanly here.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
