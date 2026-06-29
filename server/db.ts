import fs from 'fs';
import path from 'path';
import { User, SupportedExam, PYQPaper, Quiz, Flashcard, StudyPlan, Bookmark, ForumPost, Notification, HistoryItem } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface DatabaseSchema {
  users: User[];
  exams: string[];
  pyqPapers: PYQPaper[];
  quizzes: Quiz[];
  flashcards: Flashcard[];
  studyPlans: StudyPlan[];
  bookmarks: Bookmark[];
  forumPosts: ForumPost[];
  notifications: Notification[];
  history: HistoryItem[];
}

function getInitialSchema(): DatabaseSchema {
  return {
    users: [
      {
        id: 'user_1',
        email: 'gagguturusufiya@gmail.com',
        name: 'Sufiya Gagguturu',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        role: 'user',
        streak: 5,
        lastActive: new Date().toISOString(),
        studyTimeToday: 45,
        xp: 1250,
        coins: 180,
        achievements: ['first_quiz', 'streak_3', 'night_owl'],
        dailyGoalMinutes: 60,
      },
      {
        id: 'admin_1',
        email: 'admin@apexprep.ai',
        name: 'Lead Educator',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        role: 'admin',
        streak: 12,
        lastActive: new Date().toISOString(),
        studyTimeToday: 120,
        xp: 5000,
        coins: 900,
        achievements: ['content_creator', 'perfect_score'],
        dailyGoalMinutes: 120,
      }
    ],
    exams: [
      'UPSC', 'GATE', 'JEE', 'NEET', 'SSC', 'Banking', 'RRB', 'CAT', 'GRE', 'GMAT', 'State PSC', 'University', 'Engineering', 'Custom'
    ],
    pyqPapers: [
      {
        id: 'pyq_gate_cs_2025',
        exam: 'GATE',
        subject: 'Computer Science & Information Technology',
        year: 2025,
        branch: 'CS',
        paperCode: 'GATE-CS-2025',
        chapterWeightage: {
          'Operating Systems': 12,
          'Computer Networks': 10,
          'Databases': 8,
          'Algorithms & Data Structures': 15,
          'Theory of Computation': 10,
          'Digital Logic': 6,
        },
        repeatedConcepts: [
          'LRU Page Replacement Algorithm (Asked 5 years consecutively)',
          'Dijkstra\'s Shortest Path Complexity (Asked 4 times)',
          'SQL Query using Joins and Group By (Asked 6 times)',
          'Regular Expressions to DFA conversion (Asked 5 times)'
        ],
        topperTips: [
          'Focus heavily on Numerical Answer Type (NAT) questions, as they have no negative marking but require high mathematical accuracy.',
          'Solve Operating Systems memory management problems daily. They are easy marks once you understand the physical layout.'
        ],
        questions: [
          {
            id: 'q1',
            text: 'Consider a paging system with page table stored in memory. If a memory reference takes 50ns, and TLB lookup takes 10ns, what is the effective memory access time with TLB hit ratio of 90%? Assume page table has single level.',
            marks: 2,
            difficulty: 'Medium',
            frequency: 4,
            chapter: 'Operating Systems',
            solution: 'Effective Access Time (EAT) = Hit_Ratio * (TLB_time + Memory_time) + (1 - Hit_Ratio) * (TLB_time + 2 * Memory_time) = 0.90 * (10 + 50) + 0.10 * (10 + 100) = 0.90 * 60 + 0.10 * 110 = 54 + 11 = 65 ns.',
            topperAnswer: 'EAT = hit_rate * (TLB_access_time + memory_access_time) + (1 - hit_rate) * (TLB_access_time + 2 * memory_access_time) = 0.9 * (10 + 50) + 0.1 * (10 + 100) = 65ns.',
            markingScheme: '2 marks for correct calculation (65ns). 0 marks if formula or TLB access on miss is calculated incorrectly.'
          },
          {
            id: 'q2',
            text: 'Which of the following is NOT a necessary condition for a deadlock to occur?',
            marks: 1,
            difficulty: 'Easy',
            frequency: 8,
            chapter: 'Operating Systems',
            solution: 'The 4 necessary conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemption is NOT a necessary condition; rather, No Preemption is required.',
            topperAnswer: 'Deadlocks require "No Preemption" (along with Hold & Wait, Mutual Exclusion, and Circular Wait). Therefore, "Preemption" or the ability to preempt resources breaks deadlocks and is NOT a condition for it.',
            markingScheme: '1 mark for selecting No Preemption / Preemption appropriately.'
          }
        ]
      }
    ],
    quizzes: [
      {
        id: 'quiz_os_basic',
        title: 'Operating Systems Memory Management Quick Quiz',
        topic: 'Operating Systems',
        timeLimitSeconds: 300,
        totalMarks: 10,
        questions: [
          {
            id: 'q_os_1',
            question: 'What is the main purpose of virtual memory?',
            type: 'MCQ',
            options: [
              'To allow execution of processes larger than physical memory',
              'To speed up CPU clock cycles',
              'To protect the operating system from physical crashes',
              'To eliminate external fragmentation permanently'
            ],
            correctAnswer: 'To allow execution of processes larger than physical memory',
            explanation: 'Virtual memory separates user logical memory from physical memory, allowing users to run processes that require more address space than physically available.',
            hint: 'Think about physical RAM constraints versus large game or software installations.',
            difficulty: 'Easy'
          },
          {
            id: 'q_os_2',
            question: 'In paging, physical memory is broken into fixed-sized blocks called:',
            type: 'MCQ',
            options: [
              'Pages',
              'Frames',
              'Segments',
              'Blocks'
            ],
            correctAnswer: 'Frames',
            explanation: 'Physical memory is divided into fixed-size blocks called Frames, whereas logical user memory is divided into blocks of the same size called Pages.',
            hint: 'User memory uses Pages, hardware uses...',
            difficulty: 'Easy'
          }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc_1',
        topic: 'Operating Systems',
        front: 'What is thrashing in OS?',
        back: 'Thrashing occurs when a virtual memory system spends more time swapping pages in and out of disk than executing instruction code. It happens when physical memory is severely overcommitted.',
        difficulty: 'Medium',
        intervalDays: 1,
      },
      {
        id: 'fc_2',
        topic: 'Computer Networks',
        front: 'What are the layers of the OSI model?',
        back: 'Physical, Data Link, Network, Transport, Session, Presentation, Application (Mnemonic: Please Do Not Throw Sausage Pizza Away).',
        difficulty: 'Easy',
        intervalDays: 3,
      }
    ],
    studyPlans: [
      {
        id: 'plan_1',
        userId: 'user_1',
        exam: 'GATE',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        dailyTasks: [
          { id: 't1', day: 1, title: 'Study OS Paging & TLB Mechanics', durationMinutes: 45, completed: true, category: 'Operating Systems' },
          { id: 't2', day: 1, title: 'Solve 5 PYQs on TLB hit ratio', durationMinutes: 30, completed: false, category: 'Operating Systems' },
          { id: 't3', day: 2, title: 'Learn TCP Congestion Control', durationMinutes: 60, completed: false, category: 'Computer Networks' },
          { id: 't4', day: 2, title: 'Attempt TCP Basic Quiz', durationMinutes: 15, completed: false, category: 'Computer Networks' }
        ]
      }
    ],
    bookmarks: [],
    forumPosts: [
      {
        id: 'forum_1',
        userId: 'admin_1',
        userName: 'Lead Educator',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        title: 'Best Strategies to crack GATE 2027 in first attempt!',
        content: 'Hey aspirants! The key to cracking the exam is high accuracy in the Aptitude & Mathematics sections, combined with rigorous revision of the top weighted core subjects (CS, EC, ME, EE). I recommend solving the last 15 years PYQs at least twice. What subject are you focusing on this week?',
        category: 'Strategy & Tips',
        likes: ['user_1'],
        comments: [
          {
            id: 'c1',
            userId: 'user_1',
            userName: 'Sufiya Gagguturu',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            content: 'Thank you for this post! I\'m currently focusing on OS and DBMS memory calculations. The weightage is huge.',
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ],
    notifications: [
      {
        id: 'not_1',
        userId: 'user_1',
        title: 'Streak Maintained! 🔥',
        message: 'Congratulations! You have studied 5 days in a row. Keep the momentum going!',
        type: 'streak',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'not_2',
        userId: 'user_1',
        title: 'GATE 2025 Solved Paper Available',
        message: 'The comprehensive PYQ analysis for GATE Computer Science has been parsed by AI.',
        type: 'exam',
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
      }
    ],
    history: [
      {
        id: 'hist_1',
        userId: 'user_1',
        type: 'note',
        title: 'AI Notes: LRU Page Replacement',
        query: 'LRU Page Replacement',
        content: '# Exam Notes: LRU Page Replacement\\n## 1. Executive Summary\\n* **Core Concept**: Evicts the least recently used page first.\\n* **Performance**: Excellent average hit rate.\\n* **Belady\'s Anomaly**: Does NOT suffer from Belady\'s Anomaly (it\'s a Stack Algorithm).',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
      },
      {
        id: 'hist_2',
        userId: 'user_1',
        type: 'quiz',
        title: 'Operating Systems Quick Quiz',
        query: 'Operating Systems',
        content: {
          score: 4,
          total: 5,
          topic: 'Operating Systems'
        },
        score: {
          correct: 4,
          total: 5,
          percentage: 80
        },
        createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
      },
      {
        id: 'hist_3',
        userId: 'user_1',
        type: 'search',
        title: 'Search: TCP Congestion Control',
        query: 'TCP Congestion Control',
        content: 'Interactive study engine generated for TCP Congestion Control including congestion window dynamics, slow start, congestion avoidance, fast retransmit, and fast recovery.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
      },
      {
        id: 'hist_4',
        userId: 'user_1',
        type: 'doubt',
        title: 'Doubt Resolved: TCP 3-Way Handshake',
        query: 'Why TCP uses 3-way instead of 2-way handshake?',
        content: 'Successfully resolved: Explains how a 3-way handshake prevents duplicate connection initiations from causing resource leaks.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
      }
    ]
  };
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSchema();
      writeDb(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading JSON database, resetting:', error);
    const initial = getInitialSchema();
    writeDb(initial);
    return initial;
  }
}

export function writeDb(schema: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON database:', error);
  }
}
