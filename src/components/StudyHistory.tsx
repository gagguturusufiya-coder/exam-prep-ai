import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, BookOpen, Award, Brain, Zap, Sparkles, Trash2, Calendar, 
  Search, HelpCircle, CheckCircle, X, ChevronRight, Eye, RefreshCw, 
  FileText, Check, RotateCcw, Info, MessageSquare, ArrowLeft
} from 'lucide-react';
import { HistoryItem } from '../types';

interface StudyHistoryProps {
  token?: string;
  onNavigate?: (page: string) => void;
}

export default function StudyHistory({ token, onNavigate }: StudyHistoryProps) {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'note' | 'quiz' | 'flashcard' | 'mindmap' | 'search' | 'doubt' | 'exam'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data.history || []);
      }
    } catch (err) {
      console.error('Error loading study history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const response = await fetch('/api/history/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        setHistoryList(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;
    setClearing(true);
    try {
      const response = await fetch('/api/history/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setHistoryList([]);
        setSelectedItem(null);
        setShowClearConfirm(false);
      }
    } catch (err) {
      console.error('Error clearing history:', err);
    } finally {
      setClearing(false);
    }
  };

  // Filter list based on search and selected tab
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.query || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'flashcard':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'mindmap':
        return <Zap className="w-4 h-4 text-indigo-400" />;
      case 'search':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'doubt':
        return <HelpCircle className="w-4 h-4 text-rose-400" />;
      case 'exam':
        return <FileText className="w-4 h-4 text-blue-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'quiz':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'flashcard':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'mindmap':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'search':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'doubt':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'exam':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Render markdown for note previews
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 border-b border-slate-800 pb-1">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-3 mb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-indigo-400 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={idx} className="text-slate-300 text-xs ml-4 list-disc my-0.5">{line.substring(2)}</li>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-slate-300 text-xs my-0.5 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-6" id="study_history_root_view">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="history_header_sec">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" /> Study History Room
          </h2>
          <p className="text-slate-400 text-xs">Review, retrieve, and evaluate your previously generated notes, smart searches, and active exam quizzes.</p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs cursor-pointer transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto"
            id="clear_history_btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe History</span>
          </button>
        )}
      </div>

      {/* SEARCH AND TAB BLOCK */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative" id="history_search_wrapper">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search past notes, quizzes, or topics..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs shadow-md transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="history_search_input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="history_tabs">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'note', label: 'Notes' },
            { id: 'quiz', label: 'Quizzes & Scores' },
            { id: 'search', label: 'Concept Explorations' },
            { id: 'doubt', label: 'Doubts' },
            { id: 'exam', label: 'Syllabus Analyses' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORIC LIST VIEW / GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-3" id="history_loading">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Syncing credentials to study database...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-900 text-center space-y-4" id="history_empty">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">No History Records</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {searchQuery || activeTab !== 'all' 
                ? 'No items match your active search terms or tab filters.' 
                : 'Your study history is currently clean! Once you generate notes, take quizzes, or search concepts, they will show up here.'}
            </p>
          </div>
          {searchQuery || activeTab !== 'all' ? (
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 text-indigo-400 font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => onNavigate && onNavigate('search')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Explore AI Concept Map
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4" id="history_grid">
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all cursor-pointer flex justify-between gap-4 group relative overflow-hidden"
              >
                {/* Glow bar */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  item.type === 'note' ? 'bg-emerald-500' :
                  item.type === 'quiz' ? 'bg-amber-500' :
                  item.type === 'search' ? 'bg-cyan-500' :
                  item.type === 'doubt' ? 'bg-rose-500' : 'bg-indigo-500'
                }`} />

                <div className="space-y-3 min-w-0 flex-1 pl-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getTypeBadgeColor(item.type)} flex items-center gap-1`}>
                      {getIcon(item.type)}
                      <span className="capitalize font-mono">{item.type}</span>
                    </span>

                    {item.score && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Score: {item.score.correct}/{item.score.total} ({item.score.percentage}%)
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors truncate">
                      {item.title}
                    </h4>
                    {item.query && (
                      <p className="text-slate-400 text-xs truncate italic">
                        "{item.query}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between shrink-0">
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-1 text-indigo-400 bg-indigo-500/5 group-hover:bg-indigo-500/15 border border-indigo-500/10 rounded-lg">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL DIALOG */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 top-20 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 flex flex-col max-h-[85vh]"
              id="history_detail_modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
                <div className="space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider font-mono ${getTypeBadgeColor(selectedItem.type)} inline-flex items-center gap-1`}>
                    {getIcon(selectedItem.type)}
                    <span>{selectedItem.type}</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    {selectedItem.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Frame */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6" id="history_modal_scroller">
                
                {/* 1. TYPE: NOTE */}
                {selectedItem.type === 'note' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-950 text-slate-200">
                      {renderMarkdownText(selectedItem.content)}
                    </div>
                  </div>
                )}

                {/* 2. TYPE: SEARCH / MINDMAP MODULE */}
                {selectedItem.type === 'search' && selectedItem.content && (
                  <div className="space-y-5">
                    {/* Layman Overview */}
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
                      <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider">Concept Abstract</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedItem.content.onePageSummary || selectedItem.content.simpleNotes}</p>
                    </div>

                    {/* Simple vs Detailed Notes */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-950 space-y-1">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simple Explanation</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{selectedItem.content.simpleNotes}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-950 space-y-1">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Technical Breakdown</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{selectedItem.content.detailedNotes}</p>
                      </div>
                    </div>

                    {/* Formula Matrice */}
                    {selectedItem.content.importantFormulas && selectedItem.content.importantFormulas.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Key Formulas</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedItem.content.importantFormulas.map((f: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-950 border border-slate-950 rounded-xl space-y-1 text-center">
                              <span className="text-[10px] text-slate-500 font-mono block">{f.name}</span>
                              <pre className="text-indigo-400 font-mono text-xs my-1 bg-slate-900/50 p-1 rounded border border-slate-900/50">{f.equation}</pre>
                              <span className="text-[9px] text-slate-400 block italic">{f.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mind Map Tree preview */}
                    {selectedItem.content.mindMap && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Concept Tree Structure</h4>
                        <div className="p-4 bg-slate-950 border border-slate-950 rounded-xl space-y-3 text-xs leading-relaxed">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold">
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span>{selectedItem.content.mindMap.label}</span>
                          </div>
                          {selectedItem.content.mindMap.children && (
                            <div className="pl-4 border-l border-indigo-500/25 space-y-2.5">
                              {selectedItem.content.mindMap.children.map((child: any, cidx: number) => (
                                <div key={cidx} className="space-y-1">
                                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span>{child.label}</span>
                                  </div>
                                  {child.children && (
                                    <div className="pl-4 border-l border-indigo-500/10 space-y-1 text-[11px] text-slate-400">
                                      {child.children.map((sub: any, sidx: number) => (
                                        <div key={sidx} className="flex items-center gap-1">
                                          <span>•</span>
                                          <span>{sub.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Flashcards included */}
                    {selectedItem.content.flashcards && selectedItem.content.flashcards.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Flashcard Anchors</h4>
                        <div className="grid gap-2.5">
                          {selectedItem.content.flashcards.map((fc: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-950 border border-slate-950 rounded-xl grid grid-cols-2 gap-4 text-[11px]">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">Front Question</span>
                                <p className="text-slate-300 font-medium">{fc.front}</p>
                              </div>
                              <div className="border-l border-slate-900 pl-4">
                                <span className="text-[9px] font-mono text-indigo-500 uppercase font-bold block mb-1">Back Solution</span>
                                <p className="text-indigo-200">{fc.back}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Viva Questions */}
                    {selectedItem.content.interviewQuestions && selectedItem.content.interviewQuestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Interview & Viva Solvers</h4>
                        <div className="space-y-2">
                          {selectedItem.content.interviewQuestions.map((v: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-950 border border-slate-950 rounded-xl space-y-1 text-xs">
                              <strong className="text-indigo-400 block font-semibold">Q: {v.question}</strong>
                              <p className="text-slate-300 italic">Ans: {v.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. TYPE: QUIZ SCORE BREAKDOWN */}
                {selectedItem.type === 'quiz' && selectedItem.content && (
                  <div className="space-y-5">
                    {/* Score summary */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Performance Matrix</span>
                        <h4 className="font-bold text-white text-base">Quiz Completed Successfully</h4>
                      </div>
                      <div className="text-center bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                        <span className="text-xs text-slate-400 block font-mono">SCORE</span>
                        <strong className="text-xl font-mono text-amber-400">{selectedItem.score?.correct || selectedItem.content.score}/{selectedItem.score?.total || selectedItem.content.total}</strong>
                      </div>
                    </div>

                    {/* Quiz Questions Breakdown */}
                    {selectedItem.content.quizQuestions && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Reviewed Questions</h4>
                        <div className="space-y-3">
                          {selectedItem.content.quizQuestions.map((q: any, idx: number) => {
                            const selectedAns = selectedItem.content.quizAnswers?.[idx];
                            const isCorrect = selectedAns === q.correctAnswer;
                            return (
                              <div key={idx} className="p-4 bg-slate-950 border border-slate-950 rounded-xl space-y-2.5 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                  <strong className="text-slate-200 font-semibold">{idx + 1}. {q.question}</strong>
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-2 text-[11px] pl-2 border-l-2 border-slate-900">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-500 block">Your Answer:</span>
                                    <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{selectedAns || '(Not answered)'}</span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-500 block">Correct Option:</span>
                                    <span className="text-emerald-400 font-semibold">{q.correctAnswer}</span>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] leading-relaxed text-slate-400">
                                  <span className="font-bold text-slate-300 block mb-0.5">Explanation:</span>
                                  {q.explanation}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TYPE: DOUBT SOLUTION */}
                {selectedItem.type === 'doubt' && selectedItem.content && (
                  <div className="space-y-5">
                    {/* Metaphor representation */}
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1.5">
                      <h4 className="text-xs font-bold text-rose-300 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" /> Conceptual Metaphor
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">"{selectedItem.content.simpleExplanation}"</p>
                    </div>

                    {/* Deep text */}
                    <div className="p-4 bg-slate-950 border border-slate-950 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-white font-mono uppercase">Full Technical Solution</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedItem.content.advancedExplanation}</p>
                    </div>

                    {/* Step-by-Step breakdown */}
                    {selectedItem.content.stepByStepExplanation && (
                      <div className="p-4 bg-slate-950 border border-slate-950 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Step-By-Step Mechanics</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedItem.content.stepByStepExplanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. TYPE: EXAM / PYQ ANALYSIS */}
                {selectedItem.type === 'exam' && selectedItem.content && (
                  <div className="space-y-5">
                    {/* Trends */}
                    {selectedItem.content.chapterWeightage && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Chapter Weightage Distribution</h4>
                        <div className="grid gap-2">
                          {Object.entries(selectedItem.content.chapterWeightage).map(([chap, weight]: any, cidx: number) => (
                            <div key={cidx} className="flex items-center justify-between text-xs p-2 bg-slate-950 border border-slate-950 rounded-lg">
                              <span className="text-slate-300 truncate max-w-[250px] font-medium">{chap}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-slate-900 rounded-full h-1.5">
                                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${weight}%` }} />
                                </div>
                                <span className="font-mono font-bold text-indigo-400">{weight}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Repeated concepts */}
                    {selectedItem.content.repeatedConcepts && selectedItem.content.repeatedConcepts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase">Frequently Repeated Concepts</h4>
                        <ul className="space-y-1.5">
                          {selectedItem.content.repeatedConcepts.map((concept: string, idx: number) => (
                            <li key={idx} className="p-2.5 bg-slate-950 border border-slate-950 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-indigo-400 font-bold shrink-0">#{idx + 1}</span>
                              <span>{concept}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Topper tips */}
                    {selectedItem.content.topperTips && selectedItem.content.topperTips.length > 0 && (
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2">
                        <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase flex items-center gap-1">Topper Strategy Tips</h4>
                        <ul className="space-y-1">
                          {selectedItem.content.topperTips.map((tip: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-300 leading-relaxed list-disc ml-4 my-1">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer Actions */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Created {new Date(selectedItem.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Navigate back to core tool based on type to re-simulate / re-generate
                      if (onNavigate) {
                        if (selectedItem.type === 'note') onNavigate('notes');
                        else if (selectedItem.type === 'quiz') onNavigate('search');
                        else if (selectedItem.type === 'search') onNavigate('search');
                        else if (selectedItem.type === 'doubt') onNavigate('doubt');
                        else if (selectedItem.type === 'exam') onNavigate('pyq');
                      }
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15"
                  >
                    Load in Interactive Module
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(selectedItem.id, e as any)}
                    className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Delete Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DOUBLE CONFIRM CLEAR DIALOG */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 text-center space-y-4"
              id="clear_confirm_modal"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Wipe All Study History?</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Are you absolutely sure you want to clear your entire history of generated notes, quiz grades, searches, and flashcards? This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/40 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  No, Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-600/10 flex items-center gap-1.5"
                >
                  {clearing ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  <span>Yes, Wipe Everything</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
