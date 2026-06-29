import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Award, BookOpen, Sparkles, MessageSquare, Settings, LogOut, Menu, X, Bell, FileText, HelpCircle, Calendar, Compass, User, Key, Mail, Shield, Check, AlertCircle, History, Globe, Brain, Phone, Eye, EyeOff, Clock, RefreshCw, Lock } from 'lucide-react';
import { User as UserType, SupportedExam } from './types';

// Import subcomponents
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AISearch from './components/AISearch';
import NotesGen from './components/NotesGen';
import PYQModule from './components/PYQModule';
import DoubtSolver from './components/DoubtSolver';
import StudyPlanner from './components/StudyPlanner';
import CommunityForum from './components/CommunityForum';
import SettingsComponent from './components/Settings';
import StudyHistory from './components/StudyHistory';
import AITutor from './components/AITutor';
import CareerPrep from './components/CareerPrep';
import CurrentAffairs from './components/CurrentAffairs';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [theme, setTheme] = useState<'indigo' | 'slate' | 'cosmic' | 'aurora' | 'sunset' | 'retro'>('indigo');

  useEffect(() => {
    const savedTheme = localStorage.getItem('apexprep_theme') as any;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: 'indigo' | 'slate' | 'cosmic' | 'aurora' | 'sunset' | 'retro') => {
    setTheme(newTheme);
    localStorage.setItem('apexprep_theme', newTheme);
  };

  // Search initial pass state
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('apexprep_remember_me') === 'true';
  });
  const [email, setEmail] = useState(() => {
    const remembered = localStorage.getItem('apexprep_remember_me') === 'true';
    return remembered ? (localStorage.getItem('apexprep_remembered_email') || '') : '';
  });
  const [password, setPassword] = useState(() => {
    const remembered = localStorage.getItem('apexprep_remember_me') === 'true';
    return remembered ? (localStorage.getItem('apexprep_remembered_password') || '') : '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Email and Mobile OTP flows state
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [emailName, setEmailName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileName, setMobileName] = useState('');
  const [mobileEmail, setMobileEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [expireTimer, setExpireTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [mobileNeedsRegister, setMobileNeedsRegister] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Countdown timer effect for OTP expiry and re-request limits
  useEffect(() => {
    let expireInterval: NodeJS.Timeout;
    let resendInterval: NodeJS.Timeout;
    
    if (expireTimer > 0) {
      expireInterval = setInterval(() => {
        setExpireTimer((prev) => prev - 1);
      }, 1000);
    }
    
    if (resendTimer > 0) {
      resendInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (expireInterval) clearInterval(expireInterval);
      if (resendInterval) clearInterval(resendInterval);
    };
  }, [expireTimer, resendTimer]);

  // Pull profile on start if token exists in session
  useEffect(() => {
    const savedToken = localStorage.getItem('apexprep_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  // Enforce authentication gate for protected pages
  useEffect(() => {
    const savedToken = localStorage.getItem('apexprep_token');
    if (!user && !savedToken && currentPage !== 'landing' && currentPage !== 'auth') {
      setCurrentPage('auth');
      setAuthMode('login');
    }
  }, [user, currentPage]);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentPage('dashboard');
        fetchNotifications(authToken);
      } else {
        // Clear stale token
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchNotifications = async (authToken: string) => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for parsing pasted verification codes (extracting exactly 6 digits)
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const pastedText = e.clipboardData.getData('text');
    const match = pastedText.match(/\b\d{6}\b/) || pastedText.match(/\d{6}/);
    if (match) {
      e.preventDefault();
      setter(match[0]);
    }
  };

  // Web OTP API for SMS OTP auto-fill on mobile devices
  useEffect(() => {
    if (!otpRequested || authMethod !== 'mobile') return;
    if (!('OTPCredential' in window)) return;

    const ac = new AbortController();

    const fetchOtp = async () => {
      try {
        const otp: any = await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        } as any);
        
        if (otp && otp.code) {
          setOtpValue(otp.code);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Web OTP API] Error or timed out:', err);
        }
      }
    };

    fetchOtp();

    return () => {
      ac.abort();
    };
  }, [otpRequested, authMethod]);

  // Automatically submit OTP when exactly 6 digits are reached
  useEffect(() => {
    if (otpValue.length === 6 && otpRequested) {
      handleVerifyOtp();
    }
  }, [otpValue, otpRequested]);

  useEffect(() => {
    if (otpCode.length === 6 && otpSent && authMode === 'forgot') {
      handleLoginSubmit();
    }
  }, [otpCode, otpSent, authMode]);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (authMode === 'forgot' && !otpSent) {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        let data: any = {};
        try {
          data = await response.json();
        } catch (e) {
          throw new Error(`Server returned status ${response.status}: ${response.statusText || 'Unknown error'}`);
        }

        if (response.ok) {
          setOtpSent(true);
          setAuthSuccessMessage(data.message || 'OTP sent successfully!');
          if (data.simulatedOtp) {
            setSimulatedOtp(data.simulatedOtp);
          } else {
            setSimulatedOtp(null);
          }
        } else {
          setAuthError(data.error || 'Failed to dispatch password recovery code.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Connection error dispatching code.');
      }
      return;
    }

    if (authMode === 'forgot' && otpSent) {
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email',
            value: email,
            otp: otpCode,
            action: 'forgot'
          })
        });

        let data: any = {};
        try {
          data = await response.json();
        } catch (e) {
          throw new Error(`Server returned status ${response.status}: ${response.statusText || 'Unknown error'}`);
        }

        if (response.ok) {
          setAuthSuccessMessage('Identity verified! Password metrics reset successfully. Please log in.');
          setAuthMode('login');
          setOtpSent(false);
          setOtpCode('');
        } else {
          setAuthError(data.error || 'Failed to verify recovery OTP.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Connection error verifying recovery code.');
      }
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle Remember Me credentials saving
        if (rememberMe) {
          localStorage.setItem('apexprep_remember_me', 'true');
          localStorage.setItem('apexprep_remembered_email', email);
          localStorage.setItem('apexprep_remembered_password', password);
        } else {
          localStorage.setItem('apexprep_remember_me', 'false');
          localStorage.removeItem('apexprep_remembered_email');
          localStorage.removeItem('apexprep_remembered_password');
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('apexprep_token', data.token);
        setCurrentPage('dashboard');
        fetchNotifications(data.token);
      } else {
        const errData = await response.json();
        setAuthError(errData.error || 'Authentication parameters invalid.');
      }
    } catch (err) {
      setAuthError('Failed to establish link with secure server.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get Google login URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(url, 'google_oauth_popup', 'width=500,height=600');
      if (!authWindow) {
        setAuthError('Please allow popups to sign in with Google.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google signin failed.');
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin to ensure it's from our own app domain
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.token && event.data?.user) {
        setToken(event.data.token);
        setUser(event.data.user);
        localStorage.setItem('apexprep_token', event.data.token);
        setCurrentPage('dashboard');
        fetchNotifications(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMessage('');

    const value = authMethod === 'email' ? email : mobile;
    if (!value) {
      setAuthError(`${authMethod === 'email' ? 'Email' : 'Mobile number'} is required.`);
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: authMethod,
          value,
          action: authMethod === 'email' ? 'register' : (authMode === 'signup' ? 'register' : 'login')
        })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText || 'Unknown error'}`);
      }

      if (response.ok) {
        setOtpRequested(true);
        setExpireTimer(300); // 5 minutes
        setResendTimer(60); // 1 minute
        setAuthSuccessMessage(`OTP sent successfully to ${value}!`);
        if (data.simulatedOtp) {
          setSimulatedOtp(data.simulatedOtp);
        } else {
          setSimulatedOtp(null);
        }
      } else {
        setAuthError(data.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Connection error dispatching code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthSuccessMessage('');

    const value = authMethod === 'email' ? email : mobile;
    if (!value || !otpValue) {
      setAuthError('All fields are required.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: authMethod,
          value,
          otp: otpValue,
          action: authMethod === 'email' ? 'register' : (authMode === 'signup' ? 'register' : 'login'),
          name: authMethod === 'email' ? emailName : mobileName,
          email: authMethod === 'mobile' ? mobileEmail : undefined
        })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText || 'Unknown error'}`);
      }

      if (response.ok) {
        if (authMethod === 'mobile' && !data.registered) {
          // Mobile number verified but no user exists
          setMobileNeedsRegister(true);
          setOtpRequested(false);
          setOtpTimer(0);
          setAuthSuccessMessage('Mobile verified! Please provide registration details below.');
        } else {
          // Success! Logged in
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('apexprep_token', data.token);
          setCurrentPage('dashboard');
          fetchNotifications(data.token);
          
          // Clear states
          setOtpValue('');
          setOtpRequested(false);
          setOtpTimer(0);
          setMobileNeedsRegister(false);
          setMobileName('');
          setMobileEmail('');
          setEmailName('');
          setEmail('');
          setMobile('');
        }
      } else {
        setAuthError(data.error || 'Verification failed. Please check the code.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Server error verifying code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    
    // Clear all potential credentials and tokens from localStorage
    localStorage.removeItem('apexprep_token');
    localStorage.removeItem('apexprep_remember_me');
    localStorage.removeItem('apexprep_remembered_email');
    localStorage.removeItem('apexprep_remembered_password');
    
    // Attempt to clear sessionStorage to wipe any in-memory cached elements
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear sessionStorage:', e);
    }

    // Completely clear all input fields and cached form states
    setEmail('');
    setPassword('');
    setMobile('');
    setMobileEmail('');
    setMobileName('');
    setEmailName('');
    setOtpCode('');
    setOtpValue('');
    setOtpSent(false);
    setOtpRequested(false);
    setOtpTimer(0);
    setRememberMe(false);
    setAuthError('');
    setAuthSuccessMessage('');
    setMobileNeedsRegister(false);
    setInitialSearchQuery('');
    setShowPassword(false);

    // Redirect to login
    setAuthMode('login');
    setCurrentPage('auth');
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const handleUpdateProfile = async (name: string, dailyGoalMinutes: number, avatar?: string) => {
    if (!token) return;
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, dailyGoalMinutes, avatar })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleXPAdded = async (xp: number, coins: number) => {
    if (!token) return;
    try {
      const response = await fetch('/api/gamify/add-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xpToAdd: xp, coinsToAdd: coins })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBookmark = async (type: string, title: string, content: any) => {
    if (!token) return;
    try {
      await fetch('/api/bookmarks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, title, content })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSearch = (query: string) => {
    setInitialSearchQuery(query);
    setCurrentPage('search');
    setMobileMenuOpen(false);
  };

  const handleSelectExamLanding = (exam: SupportedExam) => {
    setInitialSearchQuery(`${exam} comprehensive syllabus structure`);
    setCurrentPage('search');
  };

  const navItems = [
    { id: 'dashboard', label: 'Study Console', icon: <Compass className="w-4 h-4" /> },
    { id: 'search', label: 'AI Concept Map', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Scholar Studio', icon: <Brain className="w-4 h-4" /> },
    { id: 'notes', label: 'AI Notes Gen', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'pyq', label: 'PYQs & Solvers', icon: <FileText className="w-4 h-4" /> },
    { id: 'doubt', label: 'Doubt Solver', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'planner', label: 'Calendar Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'career', label: 'Premium Placement', icon: <Award className="w-4 h-4" /> },
    { id: 'news', label: 'Current Affairs & GK', icon: <Globe className="w-4 h-4" /> },
    { id: 'forum', label: 'Collaborative Forum', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'history', label: 'Study History', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Aesthetics Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen app-theme-bg text-slate-100 flex flex-col font-sans transition-all duration-300 relative overflow-x-hidden" id="app_root_frame" data-theme={theme}>
      
      {/* 1. PUBLIC LANDING VIEW OR AUTH GATE */}
      {currentPage === 'landing' && !user && (
        <LandingPage 
          onStart={() => setCurrentPage('auth')}
          onSelectExam={handleSelectExamLanding}
          onSearch={handleQuickSearch}
        />
      )}

      {/* AUTHENTICATION GATE SCREEN */}
      {currentPage === 'auth' && !user && (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12 relative overflow-hidden" id="auth_screen">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl relative z-10" id="auth_container_card">
            
            {/* Logo decal */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/20 mx-auto">
                EP
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">ExamPrep Study Core</h3>
              <p className="text-slate-400 text-xs">Verify your credentials or use dynamic OTP check to securely log in.</p>
            </div>

            {/* Verification Channel Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800" id="auth_method_tabs">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setOtpRequested(false);
                  setAuthError('');
                  setAuthSuccessMessage('');
                  setMobileNeedsRegister(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${authMethod === 'email' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Email Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('mobile');
                  setOtpRequested(false);
                  setAuthError('');
                  setAuthSuccessMessage('');
                  setMobileNeedsRegister(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${authMethod === 'mobile' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Mobile OTP (SMS)
              </button>
            </div>

            {/* Status alerts */}
            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2" id="auth_error_alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMessage && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-start gap-3" id="auth_success_alert">
                <div className="mt-0.5 w-5 h-5 rounded-full border border-emerald-500/50 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  {authSuccessMessage.includes('OTP sent') ? (
                    <>
                      <span className="font-bold text-[13px] text-emerald-400 leading-relaxed mb-0.5">OTP sent successfully to {authMethod === 'email' ? email : mobile}!</span>
                      <span className="text-emerald-500/80 text-xs">The code will expire in 05:00 minutes.</span>
                    </>
                  ) : (
                    <span className="font-bold text-[13px] text-emerald-400 leading-relaxed">{authSuccessMessage}</span>
                  )}
                </div>
              </div>
            )}

            {/* 1. EMAIL FLOWS */}
            {authMethod === 'email' && (
              <div className="space-y-4">
                {/* A. EMAIL LOGIN */}
                {authMode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input 
                          type="email"
                          placeholder="Enter your email address"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Security Password</label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-10 py-3 text-xs"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                          id="toggle_password_visibility"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1" id="remember_me_container">
                      <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50 outline-none cursor-pointer"
                        />
                        <span>Remember Me</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      <span>Sign In with Password</span>
                    </button>
                  </form>
                )}

                {/* B. EMAIL REGISTRATION WITH OTP GATE */}
                {authMode === 'signup' && (
                  <form onSubmit={otpRequested ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                    {!otpRequested ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Full Name</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                            <input 
                              type="text"
                              placeholder="Your display name"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                              value={emailName}
                              onChange={(e) => setEmailName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                            <input 
                              type="email"
                              placeholder="name@example.com"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          className={`w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 animate-pulse ${isSendingOtp ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {isSendingOtp ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <span>Send Verification OTP</span>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {simulatedOtp && (
                          <div className="bg-[#10101e] border border-indigo-900/50 rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-indigo-300 font-mono text-[10px] tracking-widest uppercase">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Developer Sandbox Preview</span>
                              </div>
                              <span className="bg-indigo-950/80 text-indigo-300 text-[9px] uppercase tracking-wider px-2 py-1 rounded-md">
                                Development mode
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mb-3 font-medium">
                              A simulated email OTP verification code has been dispatched:
                            </p>
                            <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg border border-slate-800/80 p-2.5">
                              <span className="text-white font-mono font-bold tracking-widest text-lg pl-2">{simulatedOtp}</span>
                              <button
                                type="button"
                                onClick={() => setOtpValue(simulatedOtp)}
                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 text-[11px] border border-indigo-900/50 px-3 py-1.5 rounded-md font-medium transition-colors"
                              >
                                Auto-fill Code
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="space-y-3 mt-2">
                          <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">6-Digit Email Verification Code</label>
                          <div className="flex items-center justify-between gap-2">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className={`w-12 h-14 bg-slate-950/80 border ${otpValue[index] ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'border-slate-800'} focus:border-indigo-500 outline-none text-slate-100 rounded-xl text-lg tracking-widest font-medium text-center transition-all`}
                                value={otpValue[index] || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (val) {
                                    const newOtp = otpValue.split('');
                                    newOtp[index] = val;
                                    setOtpValue(newOtp.join('').slice(0, 6));
                                    const nextInput = document.getElementById(`otp-input-${index + 1}`);
                                    if (nextInput) nextInput.focus();
                                  } else {
                                    const newOtp = otpValue.split('');
                                    newOtp[index] = '';
                                    setOtpValue(newOtp.join(''));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !otpValue[index]) {
                                    const prevInput = document.getElementById(`otp-input-${index - 1}`);
                                    if (prevInput) prevInput.focus();
                                  }
                                }}
                                id={`otp-input-${index}`}
                                autoComplete="off"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Countdown & Resend Option */}
                        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono py-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400/80" />
                            <span>Code expires in <strong className="text-emerald-400/90">{String(Math.floor(expireTimer / 60)).padStart(2, '0')}:{String(expireTimer % 60).padStart(2, '0')}</strong></span>
                          </div>
                          <div className="w-px h-3 bg-slate-800"></div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendTimer > 0}
                            className={`flex items-center gap-1.5 transition-all ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold'}`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'text-indigo-500/50' : ''}`} />
                            <span>Resend OTP {resendTimer > 0 && `in ${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(resendTimer % 60).padStart(2, '0')}`}</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          className={`w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)] active:scale-[0.98] ${isVerifyingOtp ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {isVerifyingOtp ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Verify &amp; Complete Registration</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOtpRequested(false)}
                          className="w-full text-center text-[11px] text-slate-500 hover:text-slate-400 font-medium underline mt-1 block cursor-pointer"
                        >
                          Edit Registration details
                        </button>
                      </>
                    )}
                  </form>
                )}

                {/* C. EMAIL PASSWORD RESET */}
                {authMode === 'forgot' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Account Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input 
                          type="email"
                          placeholder="Enter registered email..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      {otpSent && (
                        <div className="mt-3 space-y-4">
                          {simulatedOtp && (
                            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2 text-indigo-400 font-mono text-[10px] tracking-widest font-bold uppercase">
                                <Shield className="w-3 h-3" />
                                <span>[Developer Sandbox Preview]</span>
                              </div>
                              <p className="text-xs text-slate-300 font-mono mb-3">
                                A simulated email OTP verification code has been dispatched:
                              </p>
                              <div className="flex items-center justify-between bg-slate-950 rounded-lg border border-slate-800 p-3">
                                <span className="text-white font-mono font-bold tracking-widest text-sm">{simulatedOtp}</span>
                                <button
                                  type="button"
                                  onClick={() => setOtpCode(simulatedOtp)}
                                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-mono font-medium underline"
                                >
                                  Auto-fill Code
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Verification OTP Code</label>
                            <input 
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs text-center tracking-widest"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              autoComplete="one-time-code"
                              onPaste={(e) => handleOtpPaste(e, setOtpCode)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      <span>{otpSent ? 'Confirm Reset' : 'Send Recovery OTP'}</span>
                    </button>
                  </form>
                )}

                {/* Email Bottom Switches removed to be global */}
              </div>
            )}

            {/* 2. MOBILE FLOWS */}
            {authMethod === 'mobile' && (
              <div className="space-y-4">
                {mobileNeedsRegister ? (
                  /* D. SPECIAL PROFILE FORM AFTER OTP SUCCEEDS BUT ACCOUNT DOESN'T EXIST YET */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input 
                          type="text"
                          placeholder="Your display name"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                          value={mobileName}
                          onChange={(e) => setMobileName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Email Address (Optional)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input 
                          type="email"
                          placeholder="name@example.com"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                          value={mobileEmail}
                          onChange={(e) => setMobileEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      <span>Complete Registration</span>
                    </button>
                  </form>
                ) : (
                  /* E. MOBILE OTP SEND / OTP VERIFICATION FORM */
                  <form onSubmit={otpRequested ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                    {!otpRequested ? (
                      <>
                        {authMode === 'signup' && (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Full Name</label>
                              <div className="relative">
                                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                                <input 
                                  type="text"
                                  placeholder="Your display name"
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                                  value={mobileName}
                                  onChange={(e) => setMobileName(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Email Address (Optional)</label>
                              <div className="relative">
                                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                                <input 
                                  type="email"
                                  placeholder="name@example.com"
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                                  value={mobileEmail}
                                  onChange={(e) => setMobileEmail(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Mobile Number</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                            <input 
                              type="tel"
                              placeholder="+91 98765 43210"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs"
                              value={mobile}
                              onChange={(e) => setMobile(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          className={`w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 animate-pulse ${isSendingOtp ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {isSendingOtp ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <span>{authMode === 'signup' ? 'Send Registration OTP' : 'Send Login OTP'}</span>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {simulatedOtp && (
                          <div className="bg-[#10101e] border border-indigo-900/50 rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-indigo-300 font-mono text-[10px] tracking-widest uppercase">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Developer Sandbox Preview</span>
                              </div>
                              <span className="bg-indigo-950/80 text-indigo-300 text-[9px] uppercase tracking-wider px-2 py-1 rounded-md">
                                Development mode
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mb-3 font-medium">
                              A simulated SMS OTP verification code has been dispatched:
                            </p>
                            <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg border border-slate-800/80 p-2.5">
                              <span className="text-white font-mono font-bold tracking-widest text-lg pl-2">{simulatedOtp}</span>
                              <button
                                type="button"
                                onClick={() => setOtpValue(simulatedOtp)}
                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 text-[11px] border border-indigo-900/50 px-3 py-1.5 rounded-md font-medium transition-colors"
                              >
                                Auto-fill Code
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="space-y-3 mt-2">
                          <label className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">6-Digit SMS Verification Code</label>
                          <div className="flex items-center justify-between gap-2">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={`sms-otp-${index}`}
                                type="text"
                                maxLength={1}
                                className={`w-12 h-14 bg-slate-950/80 border ${otpValue[index] ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'border-slate-800'} focus:border-indigo-500 outline-none text-slate-100 rounded-xl text-lg tracking-widest font-medium text-center transition-all`}
                                value={otpValue[index] || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (val) {
                                    const newOtp = otpValue.split('');
                                    newOtp[index] = val;
                                    setOtpValue(newOtp.join('').slice(0, 6));
                                    const nextInput = document.getElementById(`sms-otp-input-${index + 1}`);
                                    if (nextInput) nextInput.focus();
                                  } else {
                                    const newOtp = otpValue.split('');
                                    newOtp[index] = '';
                                    setOtpValue(newOtp.join(''));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !otpValue[index]) {
                                    const prevInput = document.getElementById(`sms-otp-input-${index - 1}`);
                                    if (prevInput) prevInput.focus();
                                  }
                                }}
                                id={`sms-otp-input-${index}`}
                                autoComplete="off"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Countdown & Resend Option */}
                        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono py-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400/80" />
                            <span>Code expires in <strong className="text-emerald-400/90">{String(Math.floor(expireTimer / 60)).padStart(2, '0')}:{String(expireTimer % 60).padStart(2, '0')}</strong></span>
                          </div>
                          <div className="w-px h-3 bg-slate-800"></div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendTimer > 0}
                            className={`flex items-center gap-1.5 transition-all ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold'}`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'text-indigo-500/50' : ''}`} />
                            <span>Resend OTP {resendTimer > 0 && `in ${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(resendTimer % 60).padStart(2, '0')}`}</span>
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          className={`w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)] active:scale-[0.98] ${isVerifyingOtp ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {isVerifyingOtp ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Verify &amp; Sign In</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOtpRequested(false)}
                          className="w-full text-center text-[11px] text-slate-500 hover:text-slate-400 font-medium underline mt-1 block cursor-pointer"
                        >
                          Edit Mobile Details
                        </button>
                      </>
                    )}
                  </form>
                )}

                {/* Mobile Bottom Switches removed to be global */}
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/80" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono"><span className="bg-slate-900 px-3 text-slate-500">OR</span></div>
            </div>

            {/* Switch Mode Links */}
            <div className="text-center text-[11px] font-mono text-slate-500 space-y-1.5">
              {authMethod === 'email' ? (
                authMode === 'login' ? (
                  <>
                    <p>Don&apos;t have an account yet? <span className="text-indigo-400 cursor-pointer hover:underline font-bold" onClick={() => { setAuthMode('signup'); setOtpRequested(false); }}>Register via Email</span></p>
                    <p>Forgot password metrics? <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setAuthMode('forgot')}>Trigger OTP Reset</span></p>
                  </>
                ) : (
                  <p>Recall login credentials? <span className="text-indigo-400 cursor-pointer hover:underline font-bold" onClick={() => { setAuthMode('login'); setOtpRequested(false); }}>Return to Sign In</span></p>
                )
              ) : (
                authMode === 'login' ? (
                  <p>New scholar? <span className="text-indigo-400 cursor-pointer hover:underline font-bold" onClick={() => { setAuthMode('signup'); setOtpRequested(false); }}>Create Mobile Account</span></p>
                ) : (
                  <p>Recall login credentials? <span className="text-indigo-400 cursor-pointer hover:underline font-bold" onClick={() => { setAuthMode('login'); setOtpRequested(false); }}>Return to Sign In</span></p>
                )
              )}
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
              id="google_signin_btn"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Sign In with Google Account</span>
            </button>

          </div>
        </div>
      )}

      {/* 2. PROTECTED LOGGED IN APP WORKSPACE SHELL */}
      {user && (
        <div className="flex flex-1 relative" id="protected_workspace">
          
          {/* DESKTOP PERSISTENT GLASS SIDEBAR NAVIGATION */}
          <aside className="hidden lg:flex flex-col w-64 bg-slate-950/60 border-r border-slate-900 justify-between p-6 shrink-0 backdrop-blur-xl" id="desktop_sidebar">
            <div className="space-y-6">
              {/* BRAND IDENTIFIER */}
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
                <div className="w-9 h-9 rounded-xl bg-[var(--theme-gradient)] flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-300">
                  EP
                </div>
                <div>
                  <h1 className="font-sans font-bold text-sm tracking-tight text-white flex items-center gap-1">
                    ExamPrep <span className="text-[9px] bg-white/10 text-[var(--theme-accent-light)] px-1.5 py-0.5 rounded-full font-mono font-bold">AI</span>
                  </h1>
                  <p className="text-[9px] text-slate-500 font-mono">SCHOLAR PLATFORM</p>
                </div>
              </div>

              {/* NAVIGATION LINKS */}
              <nav className="space-y-1" id="desktop_nav_links">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 ${currentPage === item.id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-glow)] font-bold scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    id={`nav_btn_desktop_${item.id}`}
                  >
                    <span className={currentPage === item.id ? 'text-white' : 'text-[var(--theme-accent-light)]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* LOG OUT BUTTON */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 rounded-xl cursor-pointer transition-colors"
              id="desktop_logout_btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Console</span>
            </button>
          </aside>

          {/* MOBILE NAVIGATION SLIDE OVER DRAWER */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black z-40 lg:hidden"
                />
                
                {/* Drawer panel */}
                <motion.aside 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-900 z-50 p-6 flex flex-col justify-between"
                  id="mobile_drawer"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white font-bold text-xs">EP</div>
                        <span className="font-bold text-white text-sm">ExamPrep</span>
                      </div>
                      <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="space-y-1" id="mobile_nav_links">
                      {navItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${currentPage === item.id ? 'bg-[var(--theme-primary)] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                          <span className={currentPage === item.id ? 'text-white' : 'text-[var(--theme-accent-light)]'}>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-rose-400 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit Console</span>
                  </button>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* MAIN APPLICATION CORE WRAPPER */}
          <div className="flex-1 flex flex-col min-w-0" id="main_frame_wrapper">
            
            {/* WORKSPACE APP TOPBAR */}
            <header className="h-16 border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30" id="workspace_topbar">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer border border-slate-800 rounded-lg bg-slate-900/40"
                  id="mobile_drawer_toggle"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:block text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Dashboard Control Room &bull; <span className="text-white font-bold">{currentPage.toUpperCase()}</span>
                </div>
              </div>

              {/* USER PROFILE DECAL AND ALERTS DROPDOWN */}
              <div className="flex items-center space-x-4">
                
                {/* ALERTS DROP */}
                <div className="relative" id="notifications_dropdown_anchor">
                  <button 
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-slate-400 hover:text-white border border-slate-900 rounded-xl bg-slate-900/40 relative cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--theme-primary)] rounded-full border-2 border-slate-950 animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setNotifDropdownOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-20 space-y-3"
                          id="notif_dropdown_menu"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h4 className="font-bold text-white text-xs">Recent Alerts</h4>
                            <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">{unreadNotifCount} New</span>
                          </div>

                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1" id="notifications_list_box">
                            {notifications.length > 0 ? (
                              notifications.map((notif) => (
                                <div 
                                  key={notif.id}
                                  onClick={() => handleMarkNotifRead(notif.id)}
                                  className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-colors cursor-pointer ${notif.read ? 'bg-slate-950/20 border-slate-950/40 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <strong className={`font-semibold ${notif.read ? 'text-slate-500' : 'text-slate-200'}`}>{notif.title}</strong>
                                    {!notif.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />}
                                  </div>
                                  <p>{notif.message}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-500 text-center py-4">No active alerts available.</p>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* USER PROFILE AVATAR DECAL & DROPDOWN */}
                <div className="relative" id="user_profile_dropdown_anchor">
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 pl-2 border-l border-slate-900 cursor-pointer focus:outline-none group text-left"
                    id="user_avatar_dropdown_trigger"
                  >
                    <img 
                      src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'} 
                      className="w-8 h-8 rounded-full border border-slate-800 object-cover group-hover:border-indigo-500/50 transition-colors"
                      alt={user.name}
                    />
                    <div className="hidden sm:block">
                      <span className="text-xs font-bold text-white block truncate max-w-[120px] group-hover:text-indigo-400 transition-colors">{user.name}</span>
                      <span className="text-[9px] text-[var(--theme-accent-light)] font-mono tracking-wider block uppercase font-bold">SCHOLAR RATING</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-20 space-y-1"
                          id="user_dropdown_menu"
                        >
                          <div className="px-3 py-2 border-b border-slate-800 mb-1">
                            <p className="text-[10px] text-slate-500 font-mono uppercase">User Session</p>
                            <p className="text-xs font-bold text-white truncate">{user.email}</p>
                          </div>
                          <button
                            onClick={() => { setCurrentPage('settings'); setUserDropdownOpen(false); }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer text-left"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => { handleLogout(); setUserDropdownOpen(false); }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 cursor-pointer text-left"
                            id="header_logout_btn"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </header>

            {/* ROUTING SCENE BODY */}
            <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto" id="app_routing_scenestage">
              
              {currentPage === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  onNavigate={setCurrentPage} 
                  onQuickSearch={handleQuickSearch}
                />
              )}

              {currentPage === 'search' && (
                <AISearch 
                  initialQuery={initialSearchQuery} 
                  onBookmarkSaved={handleSaveBookmark}
                  token={token || undefined}
                />
              )}

              {currentPage === 'notes' && (
                <NotesGen 
                  token={token || undefined}
                  onBookmarkSaved={handleSaveBookmark}
                />
              )}

              {currentPage === 'pyq' && (
                <PYQModule 
                  onQuickSearch={handleQuickSearch}
                  token={token || undefined}
                />
              )}

              {currentPage === 'doubt' && (
                <DoubtSolver 
                  token={token || undefined}
                />
              )}

              {currentPage === 'planner' && (
                <StudyPlanner 
                  token={token || undefined}
                  onXPAdded={handleXPAdded}
                />
              )}

              {currentPage === 'forum' && (
                <CommunityForum 
                  token={token || undefined}
                  user={user}
                />
              )}

              {currentPage === 'tutor' && (
                <AITutor 
                  token={token || undefined}
                  user={user}
                />
              )}

              {currentPage === 'career' && (
                <CareerPrep 
                  token={token || undefined}
                  user={user}
                />
              )}

              {currentPage === 'news' && (
                <CurrentAffairs 
                  token={token || undefined}
                  user={user}
                />
              )}

              {currentPage === 'history' && (
                <StudyHistory 
                  token={token || undefined}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === 'settings' && (
                <SettingsComponent 
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  activeTheme={theme}
                  onThemeChange={handleThemeChange}
                  onLogout={handleLogout}
                />
              )}

            </main>

          </div>

        </div>
      )}

    </div>
  );
}
