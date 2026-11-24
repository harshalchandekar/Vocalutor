import {
  UserPlus,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Code,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SubjectConfig {
  id: string;
  name: string;
  topic: string;
  angle: number;
  elevation: number;
}

// Aligned with actual app subjects: maths, science, language, coding, history, economics
export const SUBJECTS_CONFIG: SubjectConfig[] = [
  { id: 'maths', name: 'Mathematics', topic: 'Calculus, Algebra & Geometry', angle: 0.35, elevation: 0.45 },
  { id: 'science', name: 'Science', topic: 'Physics, Chemistry & Biology', angle: 1.15, elevation: -0.35 },
  { id: 'language', name: 'Language', topic: 'Literature & Communication', angle: 2.75, elevation: 0.3 },
  { id: 'coding', name: 'Coding', topic: 'Algorithms & Programming', angle: 3.55, elevation: 0.6 },
  { id: 'history', name: 'History', topic: 'World History & Culture', angle: 4.35, elevation: -0.5 },
  { id: 'economics', name: 'Economics', topic: 'Markets & Economic Systems', angle: 5.15, elevation: -0.2 }
];

export const SUBJECT_LIST = [
  { id: 'maths', name: 'Mathematics', stat: 'Calculus, Algebra & Geometry' },
  { id: 'science', name: 'Science', stat: 'Physics, Chemistry & Biology' },
  { id: 'language', name: 'Language', stat: 'Literature & Communication' },
  { id: 'coding', name: 'Coding', stat: 'Algorithms & Programming' },
  { id: 'history', name: 'History', stat: 'World History & Culture' },
  { id: 'economics', name: 'Economics', stat: 'Markets & Economic Systems' }
];

export interface FeatureItem {
  id: string;
  index: string;
  category: string;
  title: string;
  description: string;
  icon: LucideIcon;
  level: string;
  examplePrompt: string;
  href: string;
}

// Exactly 8 real features matching Vocalutor's actual application capabilities
export const REAL_FEATURES_DATA: FeatureItem[] = [
  {
    id: 'maths',
    index: '/01',
    category: 'Mathematics',
    title: 'Calculus & Algebra',
    description: 'Work through derivatives, algebraic proofs, and equations out loud with voice-guided step verification.',
    icon: Calculator,
    level: '6 Core Subjects',
    examplePrompt: 'Explain how the chain rule works in calculus',
    href: '/companions?subject=maths'
  },
  {
    id: 'science',
    index: '/02',
    category: 'Science',
    title: 'Physics & Chemistry',
    description: 'Ask questions about mechanics, chemical reactions, and biology with interactive spoken explanations.',
    icon: Beaker,
    level: '6 Core Subjects',
    examplePrompt: 'Walk me through how photosynthesis works',
    href: '/companions?subject=science'
  },
  {
    id: 'language',
    index: '/03',
    category: 'Language',
    title: 'Literature & Rhetoric',
    description: 'Practice verbal reasoning, critique essay arguments, and explore literature through open dialogue.',
    icon: BookOpen,
    level: '6 Core Subjects',
    examplePrompt: 'Help me refine this persuasive essay thesis',
    href: '/companions?subject=language'
  },
  {
    id: 'coding',
    index: '/04',
    category: 'Coding',
    title: 'Algorithms & Programming',
    description: 'Verbalize problem-solving, algorithms, and technical concepts just like in an engineering interview.',
    icon: Code,
    level: '6 Core Subjects',
    examplePrompt: 'Explain binary search vs linear search',
    href: '/companions?subject=coding'
  },
  {
    id: 'history',
    index: '/05',
    category: 'History',
    title: 'World History & Culture',
    description: 'Explore historical timelines, revolutions, and geopolitical movements through interactive conversation.',
    icon: Globe,
    level: '6 Core Subjects',
    examplePrompt: 'What key events led to the fall of the Roman Empire?',
    href: '/companions?subject=history'
  },
  {
    id: 'economics',
    index: '/06',
    category: 'Economics',
    title: 'Markets & Finance',
    description: 'Discuss supply, demand, inflation, monetary policy, and market dynamics in plain English.',
    icon: TrendingUp,
    level: '6 Core Subjects',
    examplePrompt: 'How do interest rates affect inflation?',
    href: '/companions?subject=economics'
  },
  {
    id: 'builder',
    index: '/07',
    category: 'Companion Builder',
    title: 'Custom AI Tutors',
    description: 'Create personalized tutors for any topic, choosing subject, voice gender, and teaching style (formal or casual).',
    icon: UserPlus,
    level: 'Platform Capability',
    examplePrompt: 'Build a personalized tutor for your syllabus',
    href: '/companions/new'
  },
  {
    id: 'dashboard',
    index: '/08',
    category: 'Learning Analytics',
    title: 'Dashboard & Streaks',
    description: 'Track weekly study goals, daily streaks, subject breakdowns, and session history on your personal Learning Dashboard.',
    icon: Sparkles,
    level: 'Platform Capability',
    examplePrompt: 'Review weekly progress and streaks',
    href: '/dashboard'
  }
];

export interface StepItem {
  step: string;
  title: string;
  tag: string;
  description: string;
  detail: string;
}

export const STEPS_DATA: StepItem[] = [
  {
    step: '01',
    title: 'Choose or Create a Companion',
    tag: 'COMPANION SETUP',
    description: 'Pick an AI tutor from the Companion Library across 6 subjects, or build your own custom companion with your chosen topic, voice, and teaching style.',
    detail: 'Select from Mathematics, Science, Language, Coding, History, or Economics. Customize the voice gender and tone (casual or formal) to match your study preferences.'
  },
  {
    step: '02',
    title: 'Start a Live Voice Session',
    tag: 'REAL-TIME WEBRTC',
    description: 'Connect via real-time WebRTC audio powered by Vapi AI, Deepgram, and ElevenLabs. Speak naturally into your microphone without typing.',
    detail: 'Your tutor listens and speaks back dynamically. Ask questions, interrupt naturally, and talk through challenging topics with low-latency conversational audio.'
  },
  {
    step: '03',
    title: 'Track Progress on Dashboard',
    tag: 'LEARNING ANALYTICS',
    description: 'Monitor your study minutes, weekly goals, subject breakdowns, and consecutive active-day streaks on your personal Learning Dashboard.',
    detail: 'Visualize your learning journey with activity charts, subject distribution graphs, and streak tracking. Set custom weekly goals and watch your progress compound over time.'
  }
];
