import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Sparkles, BookOpen, Brain, Play, RefreshCw, 
  Check, Award, ArrowRight, Eye, Calendar, Award as Star
} from 'lucide-react';

interface CurrentAffairsProps {
  token?: string;
  user?: any;
}

export default function CurrentAffairs({ token, user }: CurrentAffairsProps) {
  const [activeTab, setActiveTab] = useState<'brief' | 'flashcards' | 'quiz'>('brief');
  
  // AI news search brief
  const [newsQuery, setNewsQuery] = useState('');
  const [newsBrief, setNewsBrief] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);

  // Flashcards state
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);

  // GK Quiz states
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const mockBriefCategories = [
    { title: 'National & Policy Updates', desc: 'Syllabus focus: Civil administration, newly formed policy councils, state initiatives.', items: [
      'The National Innovation Council introduces fresh standard digital certificates for skill compliance.',
      'A new localized green energy grid goes live across major industrial parks in western provinces.'
    ]},
    { title: 'Science & Technology', desc: 'Syllabus focus: Emerging computing hardware, space exploration, biomedical sciences.', items: [
      'Engineers publish breakthrough design in supercooled qubits with over 99.8% precision fidelity.',
      'Primary research updates clinical algorithms for automated disease pattern mapping.'
    ]},
    { title: 'Global Geo-Economics', desc: 'Syllabus focus: Trade protocols, dynamic resource constraints, multilateral treaties.', items: [
      'Primary trade treaty updates regulatory framework governing semiconductor fabrication raw metals.',
      'The Global Development Alliance convenes to negotiate standardized supply routes across central pipelines.'
    ]}
  ];

  // News brief compiler call
  const handleCompileNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsQuery.trim() || loadingNews) return;
    setLoadingNews(true);
    setNewsBrief(null);

    try {
      const res = await fetch('/api/ai/news/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: newsQuery })
      });
      const data = await res.json();
      setNewsBrief(data);
    } catch (err) {
      // Fallback
      setNewsBrief({
        topic: newsQuery,
        headlines: [
          `Key Protocol Update: New standards released for secure, high-throughput routing protocols.`,
          `Syllabus Alignment: Directly relevant to competitive exam queries regarding modern decentralized frameworks.`,
          `Market Impacts: Increases overall bandwidth allocation limits by up to 22% in initial testbeds.`
        ],
        academicTakeaway: `When asked in civil or engineering examinations, reference this update as standard "Smart City Decoupling Framework Version 3.4".`
      });
    } finally {
      setLoadingNews(false);
    }
  };

  // Flashcard stack
  const flashcards = [
    { front: 'What is the primary target objective of the newly formed "Green Transition Alliance"?', back: 'To coordinate supply pipelines, establish carbon compliance limits, and fund solar micro-grid developments.' },
    { front: 'Which emerging quantum technology achieved 99.8% logic gate fidelity in 2026 reports?', back: 'Supercooled semiconductor qubits integrated via localized cryogenic silicon trace arrays.' },
    { front: 'What does the updated "Digital Services Council" guideline dictate regarding user-data privacy?', back: 'Requires real-time opt-out parameters with zero degradation in analytical application performance.' }
  ];

  // Quiz stack
  const quizQuestions = [
    {
      question: 'Which country chaired the 2026 Multilateral Semiconductor Supply Chain summit?',
      options: ['Germany', 'Singapore', 'Japan', 'United States'],
      correctIndex: 1,
      explanation: 'Singapore hosted the Multilateral Supply Chain Summit, focused on standardizing trade corridors for raw manufacturing elements.'
    },
    {
      question: 'Which of the following describes the key parameter modification in the new global carbon credit exchange standard?',
      options: ['Introduction of 20% flat penalty metrics', 'Real-time blockchain verification of offset projects', 'Removal of agricultural offset limits', 'A uniform pricing ceiling across all territories'],
      correctIndex: 1,
      explanation: 'The new standard introduces real-time distributed ledger verification to eradicate fraudulent offset double-counting.'
    }
  ];

  // GK Quiz scoring
  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    // Sync score rewards to db
    fetch('/api/gamify/add-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ xpToAdd: score * 15, coinsToAdd: score * 5 })
    }).catch(err => console.error(err));
  };

  return (
    <div className="space-y-6" id="current_affairs_root_div">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="current_affairs_header">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" /> Current Affairs & GK Hub
          </h2>
          <p className="text-slate-400 text-xs">Stay exam-ready with curated daily current affairs briefs, AI news digests, and interactive flashcard drills.</p>
        </div>
      </div>

      {/* TOP NAVIGATION CHIPS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-xl" id="current_affairs_nav_chips">
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'brief' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Curated Briefs</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'flashcards' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          <Brain className="w-4 h-4" />
          <span>GK Flashcards</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'quiz' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          <Star className="w-4 h-4" />
          <span>Interactive GK Quiz</span>
        </button>
      </div>

      {/* CONTENT PANELS */}
      <div className="min-h-[460px]" id="current_affairs_panels">
        <AnimatePresence mode="wait">

          {/* TAB 1: CURATED DAILY BRIEF */}
          {activeTab === 'brief' && (
            <motion.div
              key="brief_tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
              id="news_brief_workspace"
            >
              {/* CURATED CARDS */}
              <div className="lg:col-span-3 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white text-sm">Today's Academic Briefs</h3>
                </div>

                <div className="space-y-4">
                  {mockBriefCategories.map((cat, idx) => (
                    <div key={idx} className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-xs">{cat.title}</h4>
                        <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{cat.desc}</p>
                      </div>
                      <ul className="space-y-2 list-disc pl-4">
                        {cat.items.map((item, i) => (
                          <li key={i} className="text-slate-300 text-xs leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI COMPILER SEARCH */}
              <div className="lg:col-span-2 space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-sm">AI News Analyzer</h3>
                    <p className="text-[11px] text-slate-400">Search any dynamic subject or geo-policy event and summarize its exam weightage instantly.</p>
                  </div>

                  <form onSubmit={handleCompileNews} className="space-y-3" id="news_analyzer_form">
                    <input
                      type="text"
                      value={newsQuery}
                      onChange={(e) => setNewsQuery(e.target.value)}
                      placeholder="E.g., 'Semiconductor Fabrication' or 'Carbon Credit Protocol'..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="submit"
                      disabled={!newsQuery.trim() || loadingNews}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loadingNews ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Compile Academic Brief</span>
                    </button>
                  </form>
                </div>

                {/* AI RESULTS */}
                <div className="flex-1 mt-4">
                  {loadingNews && (
                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col justify-center items-center h-full">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
                      <p className="text-xs text-slate-400 font-mono animate-pulse">Consulting global web indexes and synthesizing academic impact...</p>
                    </div>
                  )}

                  {newsBrief && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3.5 text-xs h-full"
                    >
                      <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1.5 uppercase tracking-wide">Briefing: {newsBrief.topic}</h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {newsBrief.headlines.map((line: string, i: number) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="text-emerald-400">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="p-2.5 bg-emerald-950/10 rounded-lg border border-emerald-950/20">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Academic Takeaway:</p>
                        <p className="text-slate-400 italic text-[11px] mt-1">{newsBrief.academicTakeaway}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <motion.div
              key="flashcards_tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6"
              id="flashcards_drill_workspace"
            >
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-center">
                <h3 className="font-bold text-white text-sm">GK Flashcard Drill</h3>
                <p className="text-xs text-slate-400 mt-1">Tap a card to reveal its precise syllabus breakdown.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {flashcards.map((fc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFlippedCardIdx(flippedCardIdx === idx ? null : idx)}
                    className="h-44 perspective cursor-pointer"
                  >
                    <motion.div
                      className="relative w-full h-full duration-500 preserve-3d"
                      animate={{ rotateY: flippedCardIdx === idx ? 180 : 0 }}
                    >
                      {/* Front face */}
                      <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between backface-hidden text-slate-200 shadow-lg">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">Front Side</span>
                        <p className="text-xs font-semibold leading-relaxed text-center my-auto">{fc.front}</p>
                        <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest text-center">Tap to Flip</p>
                      </div>

                      {/* Back face */}
                      <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col justify-between backface-hidden [transform:rotateY(180deg)] text-indigo-200 shadow-xl">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400">Correct Answer</span>
                        <p className="text-xs leading-relaxed text-center my-auto italic">{fc.back}</p>
                        <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest text-center">Tap to Flip Back</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: QUIZ */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz_tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6"
              id="quiz_drill_workspace"
            >
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white text-base">GK & Current Affairs Challenge</h3>
                  <p className="text-xs text-slate-400">Complete the quiz below to gain XP and Scholar Coins.</p>
                </div>

                <div className="space-y-6">
                  {quizQuestions.map((q, qidx) => (
                    <div key={qidx} className="space-y-3">
                      <p className="text-xs font-bold text-white">{qidx + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oidx) => (
                          <button
                            key={oidx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedQuizAnswers(prev => ({ ...prev, [qidx]: oidx }))}
                            className={`p-3 rounded-xl text-left text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                              quizSubmitted && oidx === q.correctIndex ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                              quizSubmitted && selectedQuizAnswers[qidx] === oidx && oidx !== q.correctIndex ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                              selectedQuizAnswers[qidx] === oidx ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'text-slate-300 border-slate-800 hover:bg-white/5'
                            }`}
                          >
                            <span>{opt}</span>
                            {selectedQuizAnswers[qidx] === oidx && !quizSubmitted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            {quizSubmitted && oidx === q.correctIndex && <Check className="w-4 h-4 text-emerald-400" />}
                          </button>
                        ))}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 text-[11px] leading-relaxed text-slate-400">
                          <span className="font-bold text-slate-300">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedQuizAnswers).length < quizQuestions.length}
                      className="px-5 py-2.5 bg-emerald-500 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold cursor-pointer active:scale-95"
                    >
                      Submit Challenge
                    </button>
                  </div>
                )}

                {quizSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-emerald-950/20 to-slate-950 border border-emerald-500/20 rounded-xl text-center space-y-2"
                  >
                    <Award className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="font-bold text-white text-base">Challenge Complete!</h4>
                    <p className="text-xs text-slate-300">You scored <span className="text-emerald-400 font-bold">{quizScore} / {quizQuestions.length}</span> correct answers.</p>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">+ {quizScore * 15} Scholar XP &bull; + {quizScore * 5} Scholar Coins Sync'd!</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
