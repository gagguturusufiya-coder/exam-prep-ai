import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, Filter, Search, Award, BookOpen, AlertTriangle, ChevronDown, CheckCircle, HelpCircle, Activity, Info, BarChart2 } from 'lucide-react';
import { SupportedExam } from '../types';

interface PYQModuleProps {
  onQuickSearch?: (query: string) => void;
  token?: string;
}

export default function PYQModule({ onQuickSearch, token }: PYQModuleProps) {
  const [selectedExam, setSelectedExam] = useState<SupportedExam>('GATE');
  const [subject, setSubject] = useState('Computer Science');
  const [year, setYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'questions' | 'predictions'>('trends');

  const exams: SupportedExam[] = ['UPSC', 'GATE', 'JEE', 'NEET', 'SSC', 'Banking', 'RRB', 'CAT', 'GRE', 'GMAT', 'State PSC', 'University', 'Engineering', 'Custom'];
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/pyq/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: selectedExam,
          subject,
          year: parseInt(year) || 2025
        })
      });
      const data = await response.json();
      setAnalysisResult(data);

      if (token) {
        fetch('/api/history/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'exam',
            title: `PYQ Analysis: ${selectedExam} ${subject} (${year})`,
            query: `${selectedExam} ${subject} ${year}`,
            content: data
          })
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('PYQ analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6" id="pyq_module_root">
      
      {/* HEADER EXPOSITION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" /> PYQ Analyzer & Solved Papers
        </h2>
        <p className="text-slate-400 text-xs">Search previous year papers to reveal chapter weightage, repeated concepts, marking schemes, and predicted topper answers.</p>
      </div>

      {/* FILTER SEARCH FORM */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 shadow-xl" id="pyq_filter_card">
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Select Exam</label>
            <div className="relative">
              <select 
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value as any)}
                className="w-full appearance-none bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 rounded-xl px-4 py-3 text-xs cursor-pointer"
                id="pyq_exam_select"
              >
                {exams.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Subject / Topic</label>
            <input 
              type="text"
              placeholder="e.g., 'Computer Science' or 'History'"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              id="pyq_subject_input"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Paper Year</label>
            <div className="relative">
              <select 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 rounded-xl px-4 py-3 text-xs cursor-pointer"
                id="pyq_year_select"
              >
                {years.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !subject.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
            id="pyq_analyze_submit_btn"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Analyze Solved Trends</span>
          </button>
        </form>
      </div>

      {/* SKELETON LOADER */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center bg-slate-900/40 border border-slate-900 rounded-2xl space-y-4"
            id="pyq_loading_skele"
          >
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Aggregating Competitive Database...</h3>
              <p className="text-slate-500 text-xs font-mono">Running Gemini trend analysis on chapter weightages and topper metrics.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYSIS RESULTS PANEL */}
      {analysisResult && !loading && (
        <div className="space-y-6" id="pyq_analysis_panel">
          
          {/* HEADER SUMMARY DECAL */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between" id="pyq_results_decal">
            <div>
              <h3 className="text-lg font-bold text-white">{analysisResult.exam} Solved Trend Map: {analysisResult.subject}</h3>
              <p className="text-slate-400 text-xs mt-1">Weightage distributions and predicted questions generated in real-time by AI.</p>
            </div>
          </div>

          {/* INTERNAL ROUTING TABS */}
          <div className="flex border-b border-slate-900" id="pyq_internal_tabs">
            {[
              { id: 'trends', label: 'Chapter Weightage & Trends' },
              { id: 'predictions', label: 'Predicted Expected Paper' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-3 border-b-2 text-xs font-semibold cursor-pointer transition-colors ${activeSubTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                id={`pyq_subtab_btn_${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT SCENE */}
          <div className="min-h-[250px]" id="pyq_tab_scene">
            
            {/* TRENDS PANEL */}
            {activeSubTab === 'trends' && (
              <div className="grid md:grid-cols-2 gap-6" id="pyq_trends_content">
                
                {/* Weightage SVG progress map */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                    <BarChart2 className="w-4.5 h-4.5" /> Predicted Chapter Weightage (%)
                  </h4>
                  <div className="space-y-4 pt-2">
                    {Object.entries(analysisResult.chapterWeightage || {}).map(([chap, wt]: any) => (
                      <div key={chap} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                          <span>{chap}</span>
                          <span className="font-mono text-indigo-400">{wt}%</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${wt}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repeated concepts and strategy logs */}
                <div className="space-y-6">
                  
                  {/* Repeated Concepts */}
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5" /> High Frequency Repeated Concepts
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.repeatedConcepts?.map((concept: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-2 text-xs text-slate-300 leading-normal">
                          <span className="text-amber-500 font-bold shrink-0">&bull;</span>
                          <span>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Topper Advice */}
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                      <Award className="w-4.5 h-4.5" /> Scholar Topper Study Tips
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.topperTips?.map((tip: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-2 text-xs text-slate-300 leading-normal">
                          <span className="text-emerald-500 font-bold shrink-0">&#10004;</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* EXPECTED PAPERS predictions */}
            {activeSubTab === 'predictions' && analysisResult.expectedQuestions && (
              <div className="space-y-6" id="pyq_predictions_content">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Predicted Expected Mock Paper Questions</h4>
                    <p className="text-slate-400 text-xs">Based on previous decade question densities, Gemini predicted these high probability models.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {analysisResult.expectedQuestions.map((q: any, i: number) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4" id={`predicted_q_${i}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">{q.chapter || 'Syllabus Core'}</span>
                          <h5 className="font-bold text-slate-200 text-sm leading-relaxed">{q.text}</h5>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold block">{q.marks} Marks</span>
                          <span className="text-[10px] text-slate-500 block mt-1 font-mono">{q.difficulty}</span>
                        </div>
                      </div>

                      {/* Marking scheme, solutions, and toppers answer sheets */}
                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900" id={`predicted_details_${i}`}>
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Official Solution</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">{q.solution}</p>
                        </div>
                        <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Model Topper Answer</span>
                          <p className="text-indigo-200 text-[11px] leading-relaxed whitespace-pre-line">{q.topperAnswer}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Grading Marking Scheme</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">{q.markingScheme}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* INITIAL CONSOLE LOGO IF EMPTY */}
      {!analysisResult && !loading && (
        <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl space-y-4" id="pyq_initial_screen">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">Select Your Syllabus to Begin PYQ Analytics</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">Our analyzer parses and generates expectations models automatically using past examinations patterns.</p>
          </div>
        </div>
      )}

    </div>
  );
}
