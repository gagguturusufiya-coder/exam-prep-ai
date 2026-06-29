import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, Brain, Clock, ShieldCheck, MessageSquare, ArrowRight, Star, Award, Zap, Sparkles, CheckCircle } from 'lucide-react';
import { SupportedExam } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onSelectExam: (exam: SupportedExam) => void;
  onSearch: (query: string) => void;
}

export default function LandingPage({ onStart, onSelectExam, onSearch }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const exams: { name: SupportedExam; desc: string; icon: string; category: string }[] = [
    { name: 'UPSC', desc: 'Civil Services Examination', icon: '🏛️', category: 'Government' },
    { name: 'GATE', desc: 'Graduate Aptitude Test in Engineering', icon: '⚙️', category: 'Engineering' },
    { name: 'JEE', desc: 'Joint Entrance Exam (Mains & Advanced)', icon: '📐', category: 'Engineering' },
    { name: 'NEET', desc: 'National Eligibility cum Entrance Test', icon: '⚕️', category: 'Medical' },
    { name: 'SSC', desc: 'Staff Selection Commission Exams', icon: '👔', category: 'Government' },
    { name: 'Banking', desc: 'IBPS PO, SBI Clerk & RBI Officers', icon: '💰', category: 'Finance' },
    { name: 'RRB', desc: 'Railway Recruitment Board', icon: '🚂', category: 'Government' },
    { name: 'CAT', desc: 'Common Admission Test', icon: '📈', category: 'Management' },
    { name: 'GRE', desc: 'Graduate Record Examinations', icon: '✈️', category: 'Study Abroad' },
    { name: 'GMAT', desc: 'Graduate Management Admission Test', icon: '💼', category: 'Study Abroad' },
    { name: 'State PSC', desc: 'State Public Service Commissions', icon: '🗺️', category: 'Government' },
    { name: 'University', desc: 'Semester & Academic Exams', icon: '🏫', category: 'Academic' }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" id="feature_brain_icon" />,
      title: 'Smart AI Search',
      desc: 'Type any academic topic and immediately generate detailed notes, interactive mind maps, flashcards, formulas, and quizzes in under 5 seconds.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" id="feature_ai_icon" />,
      title: 'Previous Year Solver',
      desc: 'Input your exam and year. AI analyzes subject weightage, highlights repeated concepts, predicts expected questions, and builds comprehensive solutions.'
    },
    {
      icon: <Clock className="w-6 h-6 text-emerald-400" id="feature_clock_icon" />,
      title: 'Personalized study plans',
      desc: 'Set your exam date and study hours. Our coach dynamically distributes chapters, factoring in your weak and strong subjects to maximize your score.'
    },
    {
      icon: <Zap className="w-6 h-6 text-rose-400" id="feature_zap_icon" />,
      title: 'Gamified Exam Engine',
      desc: 'Attempt adaptive mock exams styled after actual university and national patterns. Earn XP, rank on active leaderboards, and win master badges.'
    }
  ];

  const testimonials = [
    {
      name: 'Aditya Sen',
      score: 'AIR 42, GATE CS 2026',
      text: 'The PYQ analysis of ExamPrep AI predicted the OS memory question exactly. Having customized mind maps and active recall flashcards in one click saved me hundreds of hours.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
    },
    {
      name: 'Dr. Meera Nair',
      score: 'UPSC Aspirant / Rank Candidate',
      text: 'The AI Notes Generator makes preparing for dynamic current affairs incredibly structured. I simply paste news articles, and it structures notes using standard UPSC formats.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
    }
  ];

  const filteredExams = exams.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen app-theme-bg text-slate-100 flex flex-col justify-between selection:bg-[var(--theme-primary)] selection:text-white transition-colors duration-500 relative" id="landing_root">
      
      {/* BACKGROUND GLOW BLOB DECORATION */}
      <div className="absolute top-20 left-1/4 w-[35rem] h-[35rem] theme-blob-primary -z-10" />
      <div className="absolute top-[40rem] right-10 w-[30rem] h-[30rem] theme-blob-secondary -z-10" />
      <div className="absolute bottom-20 left-10 w-[25rem] h-[25rem] theme-blob-primary -z-10 animate-pulse" />

      {/* HEADER NAVBAR */}
      <header className="border-b border-white/5 bg-slate-950/30 backdrop-blur-xl sticky top-0 z-50 px-6 py-4" id="landing_header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-gradient)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--theme-glow)] transition-all" id="brand_logo">
              EP
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                ExamPrep <span className="text-xs bg-white/10 text-[var(--theme-accent-light)] px-2.5 py-0.5 rounded-full font-mono border border-white/10 font-bold">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">NEXT-GEN LEARNING PLATFORM</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onStart}
              className="px-5 py-2.5 rounded-xl app-theme-btn-primary transition-all font-bold text-xs text-white active:scale-95 cursor-pointer"
              id="header_login_btn"
            >
              Sign In / Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden max-w-7xl mx-auto w-full" id="landing_hero">
        <div className="text-center relative z-10 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/5 text-[var(--theme-accent-light)] text-xs font-mono mb-6 shadow-md"
          >
            <Sparkles className="w-4.5 h-4.5 text-[var(--theme-accent-light)] animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI-Optimized Learning Architecture 3.5</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            Master Any Exam with <br />
            <span className="app-theme-text-gradient font-black filter drop-shadow-sm">
              Personalized AI Guidance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Transform syllabus PDF sheets, custom notebooks, or standard formulas into exhaustive notes,
            dynamic mind maps, and interactive simulated mock exams styled precisely to national pattern rules.
          </motion.p>

          {/* DYNAMIC SEARCH BAR */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="bg-slate-950/80 border border-white/5 p-2.5 rounded-2xl flex items-center gap-2 max-w-xl mx-auto shadow-2xl focus-within:border-[var(--theme-primary)] transition-all mb-4 glowing-input"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input 
              type="text"
              placeholder="Search a topic, e.g., 'Operating System Paging'..."
              className="bg-transparent border-0 outline-none w-full text-slate-100 placeholder-slate-400 text-sm py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="landing_search_input"
            />
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl app-theme-btn-primary font-bold text-xs transition-colors flex items-center gap-1.5 text-white active:scale-95 shrink-0 cursor-pointer"
              id="landing_search_submit_btn"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          <p className="text-xs text-slate-400 font-mono">
            Try: <span className="text-[var(--theme-accent-light)] cursor-pointer hover:underline font-semibold" onClick={() => { setSearchQuery('Operating System'); onSearch('Operating System'); }}>Operating System</span>, <span className="text-[var(--theme-accent-light)] cursor-pointer hover:underline font-semibold" onClick={() => { setSearchQuery('Data Structures'); onSearch('Data Structures'); }}>Data Structures</span>, or <span className="text-[var(--theme-accent-light)] cursor-pointer hover:underline font-semibold" onClick={() => { setSearchQuery('UPSC Civil Services Syllabus'); onSearch('UPSC Civil Services Syllabus'); }}>UPSC Civil Services Syllabus</span>
          </p>
        </div>
      </section>

      {/* SUPPORTED EXAMS CAROUSEL */}
      <section className="py-12 bg-slate-950/20 border-y border-white/5 px-6" id="landing_exams">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <p className="text-[var(--theme-accent-light)] text-xs font-mono tracking-wider uppercase mb-1 font-bold">CURATED ACADEMIC ALIGNMENT</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Supported Competitions & Exams</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mt-2 md:mt-0">
              Pick your target curriculum. Our engine configures its generative constraints according to native pattern marks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="exams_grid">
            {filteredExams.slice(0, 8).map((exam, idx) => (
              <motion.div 
                key={exam.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => onSelectExam(exam.name)}
                className="p-5 rounded-2xl app-theme-card cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl mb-3 block">{exam.icon}</span>
                  <h3 className="font-bold text-white group-hover:text-[var(--theme-accent-light)] transition-colors">{exam.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{exam.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--theme-accent-light)] font-bold">
                  <span>{exam.category}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">Select &rarr;</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / BENTO FEATURES */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full" id="landing_features">
        <div className="text-center mb-12">
          <p className="text-[var(--theme-accent-light)] text-xs font-mono tracking-wider uppercase mb-1 font-bold">CRAFTED FOR PEAK PERFORMANCE</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Features Engineered for Top Ranks</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl app-theme-card flex items-start space-x-4"
            >
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 shrink-0 shadow-inner">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-slate-950/10 border-t border-white/5 px-6" id="landing_testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Loved by Thousands of Top Rankers</h2>
            <p className="text-slate-400 text-sm mt-2">Real feedback from actual students cracking dynamic competitive exams.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl app-theme-card flex flex-col justify-between"
              >
                <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                  &ldquo;{test.text}&rdquo;
                </p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={test.avatar} 
                    alt={test.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{test.name}</h4>
                    <p className="text-xs text-[var(--theme-accent-light)] font-mono font-semibold">{test.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-12 text-slate-400 text-sm" id="landing_footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-gradient)] flex items-center justify-center text-white font-bold text-sm">
              EP
            </div>
            <div>
              <p className="font-sans font-bold text-white text-sm tracking-tight">ExamPrep AI</p>
              <p className="text-[10px] text-slate-500 font-mono">POWERED BY GOOGLE GEMINI 3.5 FLASH</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono text-slate-500">
            <span>&copy; 2026 ExamPrep AI Inc.</span>
            <a href="#landing_root" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#landing_root" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
