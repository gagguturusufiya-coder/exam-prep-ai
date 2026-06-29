import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Moon, Sun, Monitor, UserCheck, Type, RefreshCw, CheckCircle, Sparkles, Camera, Shuffle, Check, Link } from 'lucide-react';
import { User } from '../types';

// @ts-ignore
import avatarCyberScholar from '../assets/images/avatar_cyber_scholar_1782544464661.jpg';
// @ts-ignore
import avatarAiAssistant from '../assets/images/avatar_ai_assistant_1782544478214.jpg';
// @ts-ignore
import avatarGalaxyPioneer from '../assets/images/avatar_galaxy_pioneer_1782544488629.jpg';

interface SettingsProps {
  user: User;
  onUpdateProfile: (name: string, dailyGoalMinutes: number, avatar?: string) => void;
  activeTheme?: 'indigo' | 'slate' | 'cosmic' | 'aurora' | 'sunset' | 'retro';
  onThemeChange?: (theme: 'indigo' | 'slate' | 'cosmic' | 'aurora' | 'sunset' | 'retro') => void;
  onLogout?: () => void;
}

export default function SettingsComponent({ user, onUpdateProfile, activeTheme = 'indigo', onThemeChange, onLogout }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalMinutes.toString());
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '');
  const [avatarSeed, setAvatarSeed] = useState('Scholar_' + Math.floor(Math.random() * 1000));
  const [avatarStyle, setAvatarStyle] = useState<'adventurer' | 'bottts' | 'avataaars' | 'lorelei'>('adventurer');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'giant'>('standard');
  const [notifications, setNotifications] = useState({
    streak: true,
    exams: true,
    reminders: false
  });
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handcraftedAvatars = [
    { id: 'cyber_scholar', name: 'Cyber Scholar', url: avatarCyberScholar, description: 'Futuristic cyber study master' },
    { id: 'ai_assistant', name: 'AI Assistant', url: avatarAiAssistant, description: 'Sleek smart robot guide' },
    { id: 'galaxy_pioneer', name: 'Galaxy Pioneer', url: avatarGalaxyPioneer, description: 'Cosmic explorer of science' }
  ];

  const handleRandomSeed = () => {
    const newSeed = 'Scholar_' + Math.floor(Math.random() * 100000);
    setAvatarSeed(newSeed);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(newSeed)}`;
    setSelectedAvatar(newAvatarUrl);
  };

  const handleStyleChange = (style: 'adventurer' | 'bottts' | 'avataaars' | 'lorelei') => {
    setAvatarStyle(style);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(avatarSeed)}`;
    setSelectedAvatar(newAvatarUrl);
  };

  const handleSeedChange = (seedVal: string) => {
    setAvatarSeed(seedVal);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seedVal)}`;
    setSelectedAvatar(newAvatarUrl);
  };

  const handleCustomUrlApply = () => {
    if (customUrlInput.trim()) {
      setSelectedAvatar(customUrlInput.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    try {
      await onUpdateProfile(name, parseInt(dailyGoal) || 45, selectedAvatar);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6" id="settings_module_root">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Platform & Study Settings
        </h2>
        <p className="text-slate-400 text-xs">Configure your daily learning streaks metrics, accessible reading parameters, and notification alerts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6" id="settings_grid">
        
        {/* EDIT PROFILE & GOALS CARD */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-6" id="settings_profile_card">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-indigo-400" /> Scholar Profile Settings
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* INTERACTIVE AVATAR SELECTOR / GENERATOR */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-4" id="settings_avatar_selector_suite">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--theme-accent-light)] font-bold uppercase">
                <Camera className="w-4 h-4 text-[var(--theme-accent-light)]" /> Configure Profile Photo
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* Large Preview */}
                <div 
                  className="relative group shrink-0 cursor-pointer" 
                  id="avatar_preview_container"
                  onClick={() => {
                    const fileInput = document.getElementById('avatar-file-upload');
                    if (fileInput) fileInput.click();
                  }}
                  title="Click to upload your own profile picture"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center">
                    <img 
                      src={selectedAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center px-1">
                      <Camera className="w-5 h-5 text-white animate-pulse mb-1" />
                      <span className="text-[9px] text-white font-mono uppercase font-bold tracking-wider">Upload Photo</span>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result && typeof event.target.result === 'string') {
                          setSelectedAvatar(event.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Selection Hub */}
                <div className="flex-1 space-y-4 w-full">
                  
                  {/* Category 1: Handcrafted Premium AI Avatars */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Premium Handcrafted AI Art</span>
                    <div className="grid grid-cols-3 gap-2">
                      {handcraftedAvatars.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.url)}
                          className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${selectedAvatar === av.url ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-sm shadow-[var(--theme-glow)]' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'}`}
                        >
                          <img 
                            src={av.url} 
                            alt={av.name} 
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="hidden lg:block truncate">
                            <p className="text-[10px] font-bold text-white truncate">{av.name}</p>
                            <p className="text-[8px] text-slate-500 truncate leading-none">{av.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: AI Infinite Seed-based Avatar Generator */}
                  <div className="space-y-2 p-3 bg-slate-900/40 border border-slate-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Dynamic Infinite Vector Generator</span>
                      <button
                        type="button"
                        onClick={handleRandomSeed}
                        className="text-[9px] font-mono text-[var(--theme-accent-light)] flex items-center gap-1 hover:underline cursor-pointer font-bold"
                      >
                        <Shuffle className="w-3 h-3" /> Shuffle Seed
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      {/* Style Presets */}
                      <div className="flex gap-1 shrink-0">
                        {(['adventurer', 'bottts', 'avataaars', 'lorelei'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => handleStyleChange(style)}
                            className={`px-1.5 py-1 text-[9px] font-mono rounded border transition-all uppercase font-semibold cursor-pointer ${avatarStyle === style ? 'bg-[var(--theme-primary)]/20 border-[var(--theme-primary)] text-white' : 'border-slate-800 text-slate-400 hover:text-white'}`}
                          >
                            {style === 'bottts' ? 'Robot' : style === 'avataaars' ? 'Human' : style === 'lorelei' ? 'Artistic' : 'Chibi'}
                          </button>
                        ))}
                      </div>

                      {/* Seed input */}
                      <input 
                        type="text"
                        placeholder="Type unique seed..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-[11px] font-mono rounded px-2.5 py-1 text-slate-200 outline-none focus:border-[var(--theme-primary)]"
                        value={avatarSeed}
                        onChange={(e) => handleSeedChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category 3: Custom Web URL */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Or Enter Direct Image URL</span>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/... or similar"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500/50"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCustomUrlApply}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Display Name</label>
                <input 
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 rounded-xl px-4 py-3 text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="settings_name_input"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Daily Study Goal (Minutes)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 rounded-xl px-4 py-3 text-xs"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  id="settings_goal_input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-900">
              {success && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Profiles sync completed!
                </span>
              )}
              <button
                type="submit"
                disabled={updating}
                className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-indigo-600/20"
                id="settings_profile_submit"
              >
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* INTERFACE COLOR & TYPOGRAPHY SETTINGS CARD */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-4 h-fit" id="settings_theme_card">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            <Type className="w-5 h-5 text-indigo-400" /> Interface Aesthetics
          </h3>

          <div className="space-y-4">
            {/* Theme Select */}
            <div>
              <label className="text-slate-400 text-xs font-mono block mb-2 uppercase">Theme Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'indigo', label: 'Space Indigo', color: 'bg-indigo-600' },
                  { id: 'slate', label: 'Steel Cyber', color: 'bg-cyan-500' },
                  { id: 'cosmic', label: 'Cosmic Nebula', color: 'bg-fuchsia-600' },
                  { id: 'aurora', label: 'Aurora Teal', color: 'bg-emerald-500' },
                  { id: 'sunset', label: 'Sunset Rose', color: 'bg-rose-500' },
                  { id: 'retro', label: 'Synthwave Retro', color: 'bg-gradient-to-r from-pink-500 to-cyan-400' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onThemeChange?.(opt.id as any)}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTheme === opt.id ? 'border-[var(--theme-primary)] text-white bg-slate-950 shadow-md shadow-[var(--theme-glow)] scale-[1.03]' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${opt.color} shadow-sm`} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Sizing */}
            <div>
              <label className="text-slate-400 text-xs font-mono block mb-2 uppercase">Accessible Fonts Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['standard', 'large', 'giant'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFontSize(opt as any)}
                    className={`p-2 rounded-lg border text-[11px] font-semibold text-center cursor-pointer transition-colors ${fontSize === opt ? 'border-indigo-500 text-white bg-slate-950' : 'border-slate-800 text-slate-400'}`}
                  >
                    <span className="capitalize">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification triggers */}
            <div className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-slate-400 text-xs font-mono block mb-1 uppercase flex items-center gap-1">
                <Bell className="w-4 h-4 text-indigo-400" /> Notifications Alerts
              </label>

              {[
                { key: 'streak', label: 'Learning Streak reminders' },
                { key: 'exams', label: 'Exam Countdown thresholds' },
                { key: 'reminders', label: 'Assignment study reminders' }
              ].map(not => (
                <label key={not.key} className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs select-none">
                  <input 
                    type="checkbox"
                    checked={(notifications as any)[not.key]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [not.key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 accent-indigo-600 bg-slate-950"
                  />
                  <span>{not.label}</span>
                </label>
              ))}
            </div>

          </div>
        </div>

        {/* ACCOUNT & SECURITY CARD */}
        {onLogout && (
          <div className="md:col-span-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-900 space-y-4" id="settings_security_card">
            <h3 className="font-bold text-rose-400 text-base tracking-tight flex items-center gap-1.5">
              <Shield className="w-5 h-5 text-rose-400" /> Account Security &amp; Session
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Active Scholar Session</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Logout to securely terminate this browser session and clear credentials cache. This ensures protected pages are no longer accessible.</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs rounded-xl cursor-pointer transition-all border border-rose-500/20 shadow-lg active:scale-95"
                id="settings_logout_btn"
              >
                End Session &amp; Logout
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
