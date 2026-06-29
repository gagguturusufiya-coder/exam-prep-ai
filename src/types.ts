/**
 * Shared Type Definitions for ApexPrep AI
 */

export interface User {
  id: string;
  email: string;
  mobile?: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  streak: number;
  lastActive?: string;
  studyTimeToday: number; // minutes
  xp: number;
  coins: number;
  achievements: string[]; // achievement keys
  dailyGoalMinutes: number;
}

export type SupportedExam =
  | 'UPSC'
  | 'GATE'
  | 'JEE'
  | 'NEET'
  | 'SSC'
  | 'Banking'
  | 'RRB'
  | 'CAT'
  | 'GRE'
  | 'GMAT'
  | 'State PSC'
  | 'University'
  | 'Engineering'
  | 'Custom';

export interface PYQPaper {
  id: string;
  exam: SupportedExam;
  subject: string;
  year: number;
  branch?: string;
  semester?: string;
  university?: string;
  paperCode?: string;
  questions: PYQQuestion[];
  chapterWeightage?: Record<string, number>;
  repeatedConcepts?: string[];
  topperTips?: string[];
}

export interface PYQQuestion {
  id: string;
  text: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: number; // times repeated
  chapter: string;
  solution?: string;
  topperAnswer?: string;
  markingScheme?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  totalMarks: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'Short' | 'Long' | 'CaseStudy' | 'Coding' | 'Numerical';
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation: string;
  hint?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  lastReviewed?: string;
  nextReview?: string;
  intervalDays?: number;
}

export interface MindNode {
  id: string;
  label: string;
  color?: string;
  children?: MindNode[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  exam: string;
  startDate: string;
  endDate: string;
  dailyTasks: {
    id: string;
    day: number;
    title: string;
    durationMinutes: number;
    completed: boolean;
    category: string;
  }[];
}

export interface Bookmark {
  id: string;
  userId: string;
  type: 'note' | 'flashcard' | 'mindmap' | 'question' | 'pdf';
  title: string;
  content: any;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  category: string;
  likes: string[]; // userIds
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'streak' | 'exam';
  read: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  type: 'note' | 'quiz' | 'flashcard' | 'mindmap' | 'search' | 'exam' | 'doubt';
  title: string;
  query?: string;
  content: any;
  createdAt: string;
  score?: {
    correct: number;
    total: number;
    percentage: number;
  };
}
