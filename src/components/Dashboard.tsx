import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Calendar, Award, Flame, Zap, Compass, 
  AlertTriangle, Play, BookOpen, TrendingUp, ThumbsUp,
  ChevronRight, Brain, Target, Cpu, Database, Network, Binary, Check 
} from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  onQuickSearch: (query: string) => void;
}

export default function Dashboard({ user, onNavigate, onQuickSearch }: DashboardProps) {
  // Hardcoded exam dates for countdown
  const examCountdowns = [
    { name: 'GATE CS 2027', date: '2027-02-06', days: 225, color: 'from-sky-500 to-indigo-500' },
    { name: 'UPSC CSE 2027', date: '2027-05-30', days: 338, color: 'from-amber-500 to-rose-500' },
    { name: 'JEE Advanced 2027', date: '2027-06-03', days: 342, color: 'from-emerald-500 to-teal-500' }
  ];

  // Past 7 days study hours for custom SVG graph
  const weeklyStudyHours = [2.5, 4.0, 3.2, 5.5, 1.5, 4.5, 3.8];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Grid list of study streak (past 4 weeks)
  const streakGrid = Array.from({ length: 28 }, (_, idx) => {
    const activeDays = [3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27];
    return activeDays.includes(idx);
  });

  const weakTopics = [
    { subject: 'Operating Systems', topic: 'LRU Page Replacement', severity: 'High' },
    { subject: 'Computer Networks', topic: 'TCP Congestion Window Dynamics', severity: 'Medium' },
    { subject: 'Algorithms', topic: 'Dynamic Programming Knapsack Matrix', severity: 'High' }
  ];

  const strongTopics = [
    { subject: 'DBMS', topic: 'Relational Algebra & Normalization' },
    { subject: 'Digital Logic', topic: 'Karnaugh Map Minimization' },
    { subject: 'Operating Systems', topic: 'Semaphore Coordination' }
  ];

  const suggestions = [
    { text: 'Practice 5 PYQs on LRU page replacement to patch your weak area.', action: 'LRU Page Replacement', type: 'weakness' },
    { text: 'Your streak is hot! 🔥 Learn "TCP Congestion Control" to complete Day 2 plan.', action: 'TCP Congestion Control', type: 'plan' },
    { text: 'Take a quick 5-question mock quiz on DBMS Normalization.', action: 'DBMS Normalization', type: 'quiz' }
  ];

  // Subject icon mapper for visual cognitive map
  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('network')) return <Network className="w-4 h-4 text-sky-400" />;
    if (s.includes('dbms') || s.includes('database')) return <Database className="w-4 h-4 text-indigo-400" />;
    if (s.includes('system') || s.includes('operating')) return <Cpu className="w-4 h-4 text-emerald-400" />;
    if (s.includes('algorithm') || s.includes('logic') || s.includes('math')) return <Binary className="w-4 h-4 text-fuchsia-400" />;
    return <BookOpen className="w-4 h-4 text-amber-400" />;
  };

  // Framer motion variants for rich entry transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10" 
      id="dashboard_root_div"
    >
      
      {/* WELCOME SECTION with premium styling */}
      <motion.div 
        variants={cardVariants}
        className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 rounded-3xl bg-slate-950/40 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden" 
        id="dashboard_welcome_card"
      >
        <div className="absolute top-0 right-0 w-96 h-96 theme-blob-primary -z-10 opacity-20 filter blur-[100px]" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 theme-blob-secondary -z-10 opacity-10 filter blur-[80px]" />
        
        {/* Futuristic circuit trace line overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-30" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[var(--theme-accent-light)] text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-light)] animate-pulse" />
            <span>AI COGNITIVE METRICS ACTIVE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
            Welcome back, <span className="app-theme-text-gradient">{user.name}</span>! 👋
          </h2>
          <p className="text-slate-400 text-sm max-w-xl font-sans leading-relaxed">
            You achieved <span className="text-white font-bold">{user.studyTimeToday} mins</span> of intense focus today. You have conquered <span className="text-[var(--theme-accent-light)] font-bold font-mono">{Math.round((user.studyTimeToday / user.dailyGoalMinutes) * 100)}%</span> of your daily milestones.
          </p>
        </div>

        {/* Gamification Display */}
        <div className="relative z-10 flex items-center gap-5 shrink-0 bg-slate-950/80 p-5 rounded-2xl border border-white/10 shadow-2xl" id="dash_gamify_header">
          <div className="text-center px-2">
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest">STREAK</p>
            <p className="text-3xl font-black text-amber-500 flex items-center gap-1 justify-center filter drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] font-display">
              <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-bounce" /> {user.streak}d
            </p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center px-2">
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest">SCHOLAR XP</p>
            <p className="text-3xl font-black text-[var(--theme-accent-light)] filter drop-shadow-[0_0_15px_var(--theme-glow)] font-display">{user.xp}</p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center px-2">
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest">COINS</p>
            <p className="text-3xl font-black text-yellow-400 font-display flex items-center justify-center gap-1">
              <span className="animate-spin" style={{ animationDuration: '6s' }}>🪙</span> {user.coins}
            </p>
          </div>
        </div>
      </motion.div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_bento">
        
        {/* WEEKLY STUDY GRAPH */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-2 p-6 rounded-3xl bg-slate-950/30 border border-white/5 flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden" 
          id="dash_chart_card"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 filter blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white text-base tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--theme-accent-light)]" /> Study Hours Analytics
              </h3>
              <span className="text-[10px] font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-400 tracking-widest">PAST 7 DAYS</span>
            </div>

            {/* Custom Responsive SVG Bar Chart with premium indicators */}
            <div className="relative h-44 w-full flex items-end justify-between pt-6 px-4 border-b border-white/5" id="svg_chart_container">
              {/* Backgrid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 pb-5">
                <div className="w-full border-t border-white" />
                <div className="w-full border-t border-white" />
                <div className="w-full border-t border-white" />
              </div>

              {weeklyStudyHours.map((hours, idx) => {
                const maxHours = Math.max(...weeklyStudyHours);
                const pct = (hours / maxHours) * 85; // cap at 85% for labels
                return (
                  <div key={idx} className="flex flex-col items-center space-y-3.5 flex-1 group z-10" id={`chart_bar_${idx}`}>
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-8 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 z-20 shadow-xl">
                        {hours} hrs
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className={`w-5 sm:w-7 rounded-t-lg bg-gradient-to-t ${idx === 5 ? 'from-[var(--theme-primary)] to-[var(--theme-accent)] shadow-[0_0_15px_var(--theme-glow)]' : 'from-slate-800 to-slate-700 group-hover:from-[var(--theme-primary)]/80 group-hover:to-[var(--theme-accent)]/80'} transition-all duration-300 cursor-pointer`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors tracking-tight font-medium">{daysOfWeek[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-5 flex items-center justify-between text-xs text-slate-400" id="chart_summary">
            <span className="font-sans">Daily Average Focus: <strong className="text-white font-mono font-semibold">3.4 hrs</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> +12% vs last week
            </span>
          </div>
        </motion.div>

        {/* DAILY GOAL PROGRESS & STREAK HEATMAP */}
        <motion.div 
          variants={cardVariants}
          className="p-6 rounded-3xl bg-slate-950/30 border border-white/5 flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden" 
          id="dash_streak_card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 filter blur-2xl pointer-events-none" />
          <div>
            <h3 className="font-display font-bold text-white text-base tracking-tight flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" /> Consistency Heatmap
            </h3>

            {/* Daily Streak Heatmap Grid */}
            <p className="text-[9px] font-mono text-slate-500 mb-3 tracking-widest uppercase">STREAK INDEX (28-DAY HISTORY)</p>
            <div className="grid grid-cols-7 gap-1.5 mb-6" id="streak_heatmap">
              {streakGrid.map((active, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.15 }}
                  className={`aspect-square rounded-sm border transition-all cursor-help ${active ? 'bg-gradient-to-tr from-[var(--theme-primary)]/80 to-[var(--theme-accent)]/80 border-white/10 shadow-[0_0_8px_var(--theme-glow)]' : 'bg-slate-950/90 border-white/5 hover:border-white/10'}`}
                  title={active ? `Active session logged on Study Day ${idx+1}` : `Offline on Study Day ${idx+1}`}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/5 relative overflow-hidden" id="dash_streak_tip">
            <div className="absolute -right-3 -bottom-3 opacity-10">
              <Award className="w-14 h-14 text-yellow-500" />
            </div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5 font-display">
              <Award className="w-4 h-4 text-yellow-500" /> Milestone Reward
            </h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans">
              Log focus sessions for <strong className="text-white">2 more days</strong> to unlock the <strong className="text-[var(--theme-accent-light)] font-mono font-bold">Academic Elite VII</strong> badge & 250 extra XP!
            </p>
          </div>
        </motion.div>
      </div>

      {/* PERFORMANCE BREAKDOWN & SUGGESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_weakness_suggestions">
        
        {/* WEAK & STRONG TOPICS COGNITIVE ENGINE - REDESIGNED */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-2 p-6 rounded-3xl bg-slate-950/30 border border-white/5 space-y-6 shadow-xl backdrop-blur-md relative overflow-hidden" 
          id="dash_cognitive_card"
        >
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-lg tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-[var(--theme-accent-light)]" /> Syllabus Cognitive Map
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">Real-time status of your subject proficiencies based on exam analysis.</p>
            </div>
            <span className="text-[9px] bg-slate-900 border border-white/10 text-[var(--theme-accent-light)] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider self-start sm:self-auto">
              DYNAMIC COGNITIVE MODEL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2" id="cognitive_split">
            
            {/* Weak topics needing attention */}
            <div className="space-y-4" id="weak_column">
              <div className="flex items-center justify-between border-b border-rose-500/10 pb-2">
                <h4 className="text-xs font-mono text-rose-400 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" /> Weak Topics (Needs Work)
                </h4>
                <span className="text-[9px] font-mono text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">ACTION REQUIRED</span>
              </div>
              
              <div className="space-y-3">
                {weakTopics.map((topic, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/5 to-transparent border border-rose-500/10 flex flex-col justify-between hover:border-rose-500/30 hover:from-rose-500/10 transition-all duration-300 cursor-pointer shadow-inner relative group" 
                    onClick={() => onQuickSearch(topic.topic)}
                  >
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <span className="text-slate-100 font-display font-semibold text-sm leading-tight block">{topic.topic}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1 shrink-0">{getSubjectIcon(topic.subject)} {topic.subject}</span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${topic.severity === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {topic.severity} Priority
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strong areas */}
            <div className="space-y-4" id="strong_column">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                <h4 className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" /> Mastered Topics (Strong)
                </h4>
                <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">EXCELLED</span>
              </div>
              
              <div className="space-y-3">
                {strongTopics.map((topic, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 flex flex-col justify-between hover:border-emerald-500/30 hover:from-emerald-500/10 transition-all duration-300 cursor-pointer shadow-inner relative group" 
                    onClick={() => onQuickSearch(topic.topic)}
                  >
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <span className="text-slate-100 font-display font-semibold text-sm leading-tight block">{topic.topic}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1 shrink-0">{getSubjectIcon(topic.subject)} {topic.subject}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" /> Mastered
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* AI STUDY SUGGESTIONS RECOMMENDATION ENGINE - REDESIGNED */}
        <motion.div 
          variants={cardVariants}
          className="p-6 rounded-3xl bg-slate-950/30 border border-white/5 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-md relative overflow-hidden" 
          id="dash_ai_suggestions"
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--theme-primary)]/5 filter blur-2xl pointer-events-none" />
          
          <div className="space-y-2">
            <h3 className="font-display font-bold text-white text-base tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" /> AI Coach Strategy
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Targeted actions designed specifically to plug conceptual leaks and optimize XP acquisition.
            </p>
          </div>

          <div className="space-y-4 flex-1 my-3" id="suggestions_list">
            {suggestions.map((sug, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuickSearch(sug.action)}
                className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/5 hover:border-[var(--theme-primary)]/40 hover:bg-slate-900/50 transition-all duration-300 cursor-pointer group flex items-start space-x-3 shadow-inner"
              >
                <div className="p-2 rounded-xl bg-slate-900 border border-white/10 shrink-0 mt-0.5 group-hover:bg-[var(--theme-primary)]/20 group-hover:border-[var(--theme-primary)]/40 transition-colors">
                  {sug.type === 'weakness' ? (
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                  ) : sug.type === 'quiz' ? (
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] text-slate-300 leading-normal font-sans font-medium group-hover:text-white transition-colors">
                    {sug.text}
                  </p>
                  <span className="text-[9px] font-mono text-[var(--theme-accent-light)] font-black uppercase tracking-widest block mt-2 transition-transform duration-300 group-hover:translate-x-1 flex items-center gap-1">
                    ACTION CODE &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium customized gradient button */}
          <button 
            type="button" 
            className="w-full p-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-display font-bold text-xs tracking-wider uppercase text-center rounded-2xl cursor-pointer transition-all active:scale-95 shadow-[0_10px_30px_rgba(236,72,153,0.3)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)]" 
            onClick={() => onNavigate('search')}
          >
            Run AI Subject Explorer &rarr;
          </button>
        </motion.div>
      </div>

      {/* ACTIVE COUNTDOWNS & TARGETS */}
      <motion.div 
        variants={cardVariants}
        className="p-6 rounded-3xl bg-slate-950/30 border border-white/5 shadow-xl backdrop-blur-md" 
        id="dash_countdowns"
      >
        <h3 className="font-display font-bold text-white text-base tracking-tight flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[var(--theme-accent-light)]" /> Official Competitive Exam Countdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="countdown_grid">
          {examCountdowns.map((exam, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.03 }}
              className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between shadow-inner relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${exam.color}`} />
              <div className="pl-3">
                <h4 className="font-display font-bold text-white text-sm group-hover:text-[var(--theme-accent-light)] transition-colors">{exam.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">{exam.date}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[var(--theme-accent-light)] font-mono block tracking-tighter filter drop-shadow-[0_0_10px_var(--theme-glow)]">{exam.days}</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">DAYS LEFT</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
