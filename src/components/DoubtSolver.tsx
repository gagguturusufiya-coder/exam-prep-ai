import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, Send, Mic, RefreshCw, BookOpen, AlertCircle, Play, CheckCircle, Volume2 } from 'lucide-react';

interface DoubtSolverProps {
  token?: string;
}

export default function DoubtSolver({ token }: DoubtSolverProps) {
  const [doubtText, setDoubtText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'stepbystep' | 'metaphor' | 'advanced'>('stepbystep');
  const [recording, setRecording] = useState(false);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doubtText })
      });
      const data = await response.json();
      setResult(data);

      if (token && data) {
        // Log resolved doubt to study history
        fetch('/api/history/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'doubt',
            title: `Doubt Resolved: ${doubtText.length > 40 ? doubtText.substring(0, 40) + '...' : doubtText}`,
            query: doubtText,
            content: data
          })
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('Doubt solver retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVoice = () => {
    setRecording(true);
    setTimeout(() => {
      setDoubtText('Explain why TCP uses a three-way handshake instead of a two-way handshake during connection establishment?');
      setRecording(false);
    }, 1500);
  };

  const speakExplanation = () => {
    if (!result) return;
    const textToSpeak = activeMode === 'metaphor' ? result.simpleExplanation : (activeMode === 'stepbystep' ? result.stepByStepExplanation : result.advancedExplanation);
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 200) + "...");
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
  };

  return (
    <div className="space-y-6" id="doubt_solver_module_root">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-400" /> Instant AI Doubt Solver
        </h2>
        <p className="text-slate-400 text-xs">Ask any question or clear standard conceptual doubts. Get step-by-step proofs and analogies instantly.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6" id="doubt_solver_grid">
        
        {/* INPUT FORM SIDEBAR */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 h-fit space-y-4" id="doubt_input_card">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Ask Your Tutor
          </h3>

          <form onSubmit={handleSolve} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="Type your exact question here (e.g., 'What is physical vs logical memory paging?')..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl p-4 text-xs font-sans resize-none pr-10"
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                id="doubt_textarea_input"
              />
              <button 
                type="button"
                onClick={handleSimulateVoice}
                title="Simulate Voice Input"
                className={`p-2 rounded-lg absolute right-3 bottom-3 border transition-colors cursor-pointer ${recording ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                id="doubt_mic_btn"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !doubtText.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
              id="doubt_solve_submit_btn"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask Doubt Solver</span>
            </button>
          </form>

          {recording && (
            <p className="text-[10px] text-red-400 font-mono text-center animate-pulse">Capturing audio stream parameters...</p>
          )}
        </div>

        {/* SOLUTIONS VIEWER PANEL */}
        <div className="md:col-span-2 space-y-4" id="doubt_solutions_panel">
          {result ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-6" id="doubt_solution_container">
              
              <div className="flex items-center justify-between border-b border-slate-900 pb-4" id="doubt_result_header">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">SOLVED EXPLANATION</span>
                  <h4 className="font-bold text-white text-sm line-clamp-1 mt-1">Doubt: &ldquo;{result.doubt}&rdquo;</h4>
                </div>
                
                <button 
                  onClick={speakExplanation}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Listen to Explanation"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>TTS Listen</span>
                </button>
              </div>

              {/* THREE CORE EXPLANATION MODES TABS */}
              <div className="flex border-b border-slate-900" id="doubt_modes_tabs">
                {[
                  { id: 'stepbystep', label: 'Step-by-Step Proof' },
                  { id: 'metaphor', label: 'Laymans Analogy' },
                  { id: 'advanced', label: 'Advanced Specs' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id as any)}
                    className={`px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${activeMode === mode.id ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
                    id={`doubt_mode_btn_${mode.id}`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* DYNAMIC TEXT FIELD */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 leading-relaxed text-sm text-slate-300" id="doubt_text_container">
                {activeMode === 'stepbystep' && (
                  <p className="whitespace-pre-line">{result.stepByStepExplanation}</p>
                )}
                {activeMode === 'metaphor' && (
                  <p className="whitespace-pre-line">{result.simpleExplanation}</p>
                )}
                {activeMode === 'advanced' && (
                  <p className="whitespace-pre-line">{result.advancedExplanation}</p>
                )}
              </div>

              {/* RELATED CORE TOPICS */}
              {result.relatedTopics && (
                <div className="space-y-2 pt-2" id="doubt_related_topics">
                  <h5 className="font-bold text-xs font-mono text-slate-500 uppercase tracking-wider">Related Syllabus Blocks:</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.relatedTopics.map((topic: string) => (
                      <span key={topic} className="px-3 py-1 rounded bg-slate-950 border border-slate-900 text-xs text-indigo-400 font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/20 border border-dashed border-slate-900 text-center space-y-4" id="doubt_empty_card">
              <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Resolution Console ready</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">Type or trigger simulated speech dictation to solve formulas, coding loops, or theoretical questions.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
