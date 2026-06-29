import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, Clock, Play, Pause, RotateCcw, Check, BookOpen, UserCheck, RefreshCw, ChevronRight } from 'lucide-react';

interface StudyPlannerProps {
  token?: string;
  onXPAdded?: (xp: number, coins: number) => void;
}

export default function StudyPlanner({ token, onXPAdded }: StudyPlannerProps) {
  // Pomodoro states
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');

  // Plan Generator states
  const [examName, setExamName] = useState('GATE');
  const [hoursDaily, setHoursDaily] = useState('3');
  const [weakTopics, setWeakTopics] = useState('');
  const [strongTopics, setStrongTopics] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Tasks schedule
  const [tasks, setTasks] = useState<any[]>([
    { id: 't1', day: 1, title: 'Analyze Operating System Paging & TLB Handshakes', durationMinutes: 45, completed: true, category: 'Operating Systems' },
    { id: 't2', day: 1, title: 'Revise Karnaugh Maps Minimization and logic gates', durationMinutes: 30, completed: false, category: 'Digital Logic' },
    { id: 't3', day: 2, title: 'Solve 10 database SQL aggregation PYQs', durationMinutes: 60, completed: false, category: 'DBMS' },
    { id: 't4', day: 3, title: 'Revise regular grammar regular expressions proofs', durationMinutes: 60, completed: false, category: 'TOC' }
  ]);

  // Pomodoro ticker effect
  useEffect(() => {
    let interval: any;
    if (pomoActive) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          if (pomoMode === 'work') {
            setPomoMinutes(5);
            setPomoMode('break');
            // Reward XP for completing Pomodoro
            if (onXPAdded) onXPAdded(40, 5);
          } else {
            setPomoMinutes(25);
            setPomoMode('work');
          }
          setPomoSeconds(0);
          setPomoActive(false);
          // Play a simple alert chime if audio allowed
          try {
            const context = new AudioContext();
            const osc = context.createOscillator();
            osc.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + 0.3);
          } catch(e){}
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoSeconds, pomoMinutes, pomoMode]);

  const handlePomoToggle = () => {
    setPomoActive(!pomoActive);
  };

  const handlePomoReset = () => {
    setPomoActive(false);
    setPomoMinutes(pomoMode === 'work' ? 25 : 5);
    setPomoSeconds(0);
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: examName,
          availableHoursDaily: hoursDaily,
          weakTopics,
          strongTopics
        })
      });
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error('Study plan compilation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState && onXPAdded) {
          // reward some XP for completing task
          onXPAdded(15, 2);
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6" id="planner_module_root">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" /> AI Study Planner & Pomodoro Focus Room
        </h2>
        <p className="text-slate-400 text-xs">Set up hyper-personalized study goals. Use the integrated Pomodoro focus clock to keep high mental retention.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="planner_content_grid">
        
        {/* POMODORO FOCUS ROOM CARD */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/20 border border-slate-900 text-center flex flex-col justify-between items-center relative overflow-hidden" id="pomodoro_focus_card">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="space-y-1 z-10 w-full">
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5 justify-center">
              <Clock className="w-5 h-5 text-indigo-400" /> Focus Pomodoro
            </h3>
            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block bg-indigo-500/10 rounded border border-indigo-500/20 py-1 max-w-[120px] mx-auto">
              {pomoMode === 'work' ? 'DEEP STUDY' : 'RELAX BREAK'}
            </span>
          </div>

          {/* TIMER DIGITS DISPLAY */}
          <div className="py-8 font-mono text-6xl font-black text-white select-none tracking-tight shrink-0 flex items-center gap-1" id="pomo_timer_digits">
            <span>{pomoMinutes.toString().padStart(2, '0')}</span>
            <span className="animate-pulse text-indigo-500">:</span>
            <span>{pomoSeconds.toString().padStart(2, '0')}</span>
          </div>

          <div className="space-y-4 w-full z-10">
            <div className="flex items-center justify-center gap-3" id="pomo_controls">
              <button 
                onClick={handlePomoToggle}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 text-white shadow-md cursor-pointer transition-colors ${pomoActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{pomoActive ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button 
                onClick={handlePomoReset}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400">Complete a 25-minute study block to earn <span className="text-indigo-400 font-bold">+40 Scholar XP</span>!</p>
          </div>
        </div>

        {/* ACTIVE CALENDAR TASKS ENGINE */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-900 flex flex-col justify-between" id="planner_calendar_card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Today's Action Calendar
              </h3>
              <span className="text-[9px] font-mono text-slate-500">ACTIVE TASKS TRACKER</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1" id="planner_tasks_list">
              {tasks.map((task, idx) => (
                <div 
                  key={task.id || idx}
                  onClick={() => toggleTaskCompleted(task.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${task.completed ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-500 opacity-60' : 'bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${task.completed ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-slate-800 bg-slate-900'}`}>
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold block ${task.completed ? 'line-through' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{task.category || 'General'} &bull; {task.durationMinutes}m</span>
                    </div>
                  </div>

                  {!task.completed && (
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider shrink-0">Click to complete</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 italic">Checking task items rewards <span className="text-emerald-400 font-semibold">+15 XP</span> instantly.</p>
        </div>

      </div>

      {/* COMPILATION ENGINE SECTION */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-4" id="planner_generator_panel">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400" /> Compile AI Personalized Study Plan
          </h3>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono">DENSE PROGRESS SCHEDULING</span>
        </div>

        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Target Exam</label>
            <input 
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              id="plan_exam_input"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Available study Hours / Day</label>
            <input 
              type="number"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
              value={hoursDaily}
              onChange={(e) => setHoursDaily(e.target.value)}
              id="plan_hours_input"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">My Weak Topics</label>
            <input 
              type="text"
              placeholder="e.g., 'LRU page replacement'"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              id="plan_weak_input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
            id="plan_compile_btn"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Compile New Calendar</span>
          </button>
        </form>
      </div>

    </div>
  );
}
