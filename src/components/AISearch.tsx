import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, BookOpen, Brain, Zap, HelpCircle, FileText, ChevronRight, Bookmark, FlipHorizontal, ArrowLeft, RefreshCw, AlertTriangle, Eye, HelpCircle as HelpIcon, Check, Award } from 'lucide-react';

interface AISearchProps {
  initialQuery?: string;
  onBookmarkSaved?: (type: string, title: string, content: any) => void;
  token?: string;
}

export default function AISearch({ initialQuery = '', onBookmarkSaved, token }: AISearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'mindmap' | 'flashcards' | 'quiz' | 'formulas' | 'viva'>('notes');
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const loadingMessages = [
    'Initializing Google Gemini Academic parser...',
    'Performing semantic layout analysis on topic index...',
    'Generating layman-friendly simple notes and explanations...',
    'Structuring full in-depth technical blueprints...',
    'Drafting formula matrices, cheat sheets, and memory mnemonics...',
    'Formulating adaptive multiple-choice quizzes and interview Viva Q&As...',
    'Assembling expandable interactive concept mind-maps...'
  ];

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Loading steps rotation
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleSearch = async (searchTopic: string) => {
    setLoading(true);
    setResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    setFlippedCard(null);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: searchTopic })
      });
      const data = await response.json();
      setResult(data);

      if (token && data) {
        // Log concept explorer search & generated assets to history
        fetch('/api/history/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'search',
            title: `Explored: ${data.topic || searchTopic}`,
            query: data.topic || searchTopic,
            content: data
          })
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('AI Search retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookmark = (tabName: string) => {
    if (onBookmarkSaved && result) {
      onBookmarkSaved(
        'note',
        `AI Notes: ${result.topic}`,
        { result, activeTab: tabName }
      );
    }
  };

  const handleQuizAnswer = (qIdx: number, selectedOption: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: selectedOption }));
  };

  const handleQuizSubmit = () => {
    if (!result?.quiz) return;
    let computedScore = 0;
    result.quiz.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        computedScore += 1;
      }
    });
    setScore(computedScore);
    setQuizSubmitted(true);

    // Reward XP in backend if logged in
    if (token) {
      fetch('/api/gamify/add-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xpToAdd: computedScore * 20, coinsToAdd: computedScore * 5 })
      }).catch(err => console.error(err));

      // Also log quiz score history
      fetch('/api/history/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'quiz',
          title: `Quiz Result: ${result.topic}`,
          query: result.topic,
          content: {
            topic: result.topic,
            quizAnswers,
            quizQuestions: result.quiz
          },
          score: {
            correct: computedScore,
            total: result.quiz.length,
            percentage: Math.round((computedScore / result.quiz.length) * 100)
          }
        })
      }).catch(err => console.error(err));
    }
  };

  return (
    <div className="space-y-6" id="ai_search_module_root">
      
      {/* HEADER EXPOSITION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="ai_search_header">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" /> Smart AI Concept Explorer
          </h2>
          <p className="text-slate-400 text-xs">Type any subject, chapter, or exam topic to construct an all-in-one learning module.</p>
        </div>
      </div>

      {/* SEARCH BOX FORUM */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-xl focus-within:border-indigo-500/50 transition-all" id="ai_search_form">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input 
          type="text"
          placeholder="Type an academic topic, e.g., 'Dynamic Programming' or 'Operating System Paging'..."
          className="bg-transparent border-0 outline-none w-full text-slate-100 placeholder-slate-500 text-sm py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="ai_search_query_input"
        />
        <button 
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          id="ai_search_submit_btn"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Generate Study Engine</span>
        </button>
      </form>

      {/* SKELETON LOADING STATE */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 rounded-3xl bg-slate-900/60 border border-slate-900 text-center space-y-6"
            id="search_loading_state"
          >
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg">AI Tutor Assembling Your Curriculum...</h3>
              <p className="text-indigo-400 text-xs font-mono animate-pulse">{loadingMessages[loadingStep]}</p>
            </div>
            <div className="max-w-md mx-auto h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse" style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT TABS PANEL */}
      {result && !loading && (
        <div className="space-y-6" id="ai_search_results_panel">
          
          {/* HEADER SUMMARY CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl" id="search_result_header_card">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-400 mb-1">
                <span>SUBJECT NODE PREPARED &bull;</span>
                <span className="bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full uppercase text-[9px] font-semibold">{result.difficulty} Difficulty</span>
              </div>
              <h3 className="text-2xl font-sans font-bold text-white tracking-tight">{result.topic}</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">{result.onePageSummary}</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleSaveBookmark(activeTab)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                id="save_note_bmark_btn"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Bookmark Notes</span>
              </button>
            </div>
          </div>

          {/* TAB SEGMENTS */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-900 pb-px" id="search_tabs_segment">
            {[
              { id: 'notes', label: 'Simple & Detailed Notes', icon: <FileText className="w-4 h-4" /> },
              { id: 'mindmap', label: 'Interactive Mind Map', icon: <Brain className="w-4 h-4" /> },
              { id: 'flashcards', label: 'Flashcards', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'quiz', label: 'Concept Quiz', icon: <HelpCircle className="w-4 h-4" /> },
              { id: 'formulas', label: 'Formulas & Hacks', icon: <Zap className="w-4 h-4" /> },
              { id: 'viva', label: 'Interview Questions', icon: <Award className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.id ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
                id={`search_tab_btn_${tab.id}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB SCENE CONTENT */}
          <div className="min-h-[300px]" id="search_tab_scene">
            
            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="grid md:grid-cols-2 gap-6" id="notes_tab_content">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Simple Metaphor notes (Laymans Language)</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{result.simpleNotes}</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Detailed Academic Blueprint</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{result.detailedNotes}</p>
                  
                  {result.definitions && (
                    <div className="pt-4 border-t border-slate-900 space-y-3">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Important Definitions</h5>
                      <div className="grid gap-2">
                        {result.definitions.map((def: any, i: number) => (
                          <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <strong className="text-white text-xs block">{def.term}</strong>
                            <p className="text-slate-400 text-xs mt-1">{def.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MIND MAP TAB */}
            {activeTab === 'mindmap' && result.mindMap && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900" id="mindmap_tab_content">
                <div className="mb-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Interactive AI Generated Mind Map</h4>
                  <p className="text-slate-400 text-xs mt-1">Explore sub-concepts and detailed definitions by navigating hierarchical branches.</p>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-900" id="mind_map_tree_canvas">
                  <div className="flex flex-col items-center">
                    <div className="px-5 py-2.5 rounded-xl bg-indigo-600 border border-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 mb-8 text-center min-w-[150px]">
                      {result.mindMap.label}
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 w-full">
                      {result.mindMap.children?.map((child: any, cIdx: number) => (
                        <div key={cIdx} className="flex flex-col items-center space-y-4 shrink-0 min-w-[140px] max-w-[200px]" id={`mind_node_branch_${cIdx}`}>
                          <div className="w-px h-6 bg-slate-800" />
                          <div className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-xs text-center">
                            {child.label}
                          </div>

                          {child.children?.map((subChild: any, scIdx: number) => (
                            <div key={scIdx} className="flex flex-col items-center w-full" id={`mind_subnode_branch_${cIdx}_${scIdx}`}>
                              <div className="w-px h-3 bg-slate-800" />
                              <div className="px-3 py-1.5 rounded bg-slate-950 border border-slate-900 text-[10px] text-slate-400 text-center w-full">
                                {subChild.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FLASHCARDS TAB */}
            {activeTab === 'flashcards' && result.flashcards && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-6" id="flashcards_tab_content">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Active Recall Flashcards</h4>
                    <p className="text-slate-400 text-xs">Utilize active recall and spaced repetition concepts to memorize effectively.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">CLICK CARD TO FLIP</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4" id="flashcards_grid">
                  {result.flashcards.map((card: any, idx: number) => {
                    const isFlipped = flippedCard === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setFlippedCard(isFlipped ? null : idx)}
                        className={`p-6 h-48 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative overflow-hidden ${isFlipped ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 shadow-xl' : 'bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800'}`}
                        id={`flashcard_item_${idx}`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 uppercase">
                          <span>Card {idx + 1}</span>
                          <span>{isFlipped ? 'REVERSE' : 'FRONT'}</span>
                        </div>

                        <div className="text-center py-4 text-sm font-medium">
                          {isFlipped ? card.back : card.front}
                        </div>

                        <div className="text-center text-[10px] font-mono text-slate-500">
                          {isFlipped ? 'Press again to see question' : 'Press to reveal answer'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && result.quiz && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-6" id="quiz_tab_content">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Interactive Revision Multiple Choice Quiz</h4>
                    <p className="text-slate-400 text-xs">Verify your knowledge immediately. Correct submissions reward XP.</p>
                  </div>
                  {quizSubmitted && (
                    <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full font-bold">
                      Score: {score} / {result.quiz.length}
                    </span>
                  )}
                </div>

                <div className="space-y-6" id="quiz_questions_container">
                  {result.quiz.map((q: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-950 border border-slate-900 space-y-3" id={`quiz_q_block_${idx}`}>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-mono font-bold flex items-center justify-center text-slate-400 border border-slate-800 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-200 text-sm leading-relaxed">{q.question}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 pl-7">
                        {q.options.map((opt: string) => {
                          const isSelected = quizAnswers[idx] === opt;
                          const isCorrect = q.correctAnswer === opt;
                          let btnStyle = 'border-slate-900 bg-slate-950 hover:bg-slate-900/60 text-slate-300';
                          
                          if (isSelected) {
                            btnStyle = 'border-indigo-500 bg-indigo-500/10 text-indigo-300';
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                            } else if (isSelected) {
                              btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-400';
                            } else {
                              btnStyle = 'border-slate-950 bg-slate-950 opacity-40 text-slate-500';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleQuizAnswer(idx, opt)}
                              disabled={quizSubmitted}
                              className={`p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-900 pl-7 text-[11px] text-slate-400 leading-relaxed">
                          <strong className="text-white block mb-1">Explanation:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < result.quiz.length}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95 text-center"
                    id="submit_search_quiz_btn"
                  >
                    Submit Quiz & Calculate Results
                  </button>
                )}
              </div>
            )}

            {/* FORMULAS & HACKS TAB */}
            {activeTab === 'formulas' && (
              <div className="grid md:grid-cols-2 gap-6" id="formulas_tab_content">
                
                {/* Formulas List */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Important Formula Cheat Sheet</h4>
                  <div className="space-y-3">
                    {result.importantFormulas?.map((form: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                        <strong className="text-white text-sm block">{form.name}</strong>
                        <div className="p-3 bg-slate-900/40 rounded text-center font-mono text-indigo-400 font-bold border border-slate-900 text-xs">
                          {form.equation}
                        </div>
                        <p className="text-slate-400 text-xs">{form.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tricks, mistakes, expected PYQs */}
                <div className="space-y-6">
                  
                  {/* Memory Tricks */}
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Memory Tricks & Mnemonics</h4>
                    <div className="space-y-3">
                      {result.memoryTricks?.map((trick: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                          <strong className="text-white text-xs block mb-1">{trick.concept}</strong>
                          <p className="text-slate-400 text-xs italic leading-relaxed">&ldquo;{trick.trick}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common mistakes */}
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-400" /> Avoiding Common Mistakes
                    </h4>
                    <div className="space-y-3">
                      {result.commonMistakes?.map((mist: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
                          <strong className="text-rose-300 text-xs block">{mist.mistake}</strong>
                          <p className="text-slate-400 text-xs leading-relaxed">{mist.correction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIVA INTERVIEW QUESTIONS */}
            {activeTab === 'viva' && result.interviewQuestions && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4" id="viva_tab_content">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 font-mono">Viva & technical Interview Questions</h4>
                <div className="space-y-3">
                  {result.interviewQuestions.map((v: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                      <p className="font-bold text-white text-sm">{v.question}</p>
                      <p className="text-slate-400 text-xs leading-relaxed pl-4 border-l border-indigo-500/30">{v.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
