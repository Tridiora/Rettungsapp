// User & Auth Types
export type UserRole = 'user' | 'moderator' | 'admin' | 'developer'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// Apprenticeship & Timeline Types
export type YearLevel = 1 | 2 | 3 | 'all'

export interface Milestone {
  id: string
  title: string
  date: string
  description?: string
  yearLevel?: 1 | 2 | 3
}

export interface ClassTimeline {
  startDate: string
  durationMonths: number
  examDate?: string
  milestones?: Milestone[]
}

// Flashcard Types
export type FlashcardStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentId?: string
  children?: Category[]
  order: number
}

export interface Flashcard {
  id: string
  front: string
  back: string
  hint?: string
  imageUrl?: string
  categoryId: string
  category?: Category
  deckId: string
  deck?: Deck
  authorId: string
  author?: User
  status: FlashcardStatus
  difficulty: DifficultyLevel
  yearLevel?: YearLevel
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Deck {
  id: string
  title: string
  description?: string
  coverImage?: string
  categoryId: string
  category?: Category
  authorId: string
  author?: User
  isOfficial: boolean
  cardCount: number
  difficulty: DifficultyLevel
  yearLevel?: YearLevel
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Study Progress (Spaced Repetition)
export interface StudyProgress {
  id: string
  userId: string
  flashcardId: string
  flashcard?: Flashcard
  box: number // Leitner box 1-5
  nextReviewAt: Date
  lastReviewedAt?: Date
  correctCount: number
  incorrectCount: number
  streak: number
}

// Quiz Types
export type QuestionType = 'multiple_choice' | 'single_choice' | 'fill_blank' | 'true_false' | 'ordering'

export interface Quiz {
  id: string
  title: string
  description?: string
  categoryId: string
  category?: Category
  questions: Question[]
  timeLimit?: number // in seconds
  passingScore: number // percentage
  isExamSimulation: boolean
  difficulty: DifficultyLevel
  yearLevel?: YearLevel
  authorId: string
  author?: User
  createdAt: Date
}

export interface Question {
  source?: string
  id: string
  quizId: string
  type: QuestionType
  text: string
  imageUrl?: string
  answers: Answer[]
  explanation?: string
  simpleExplanation?: string
  simpleText?: string
  points: number
  order: number
}

export interface Answer {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  order: number
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  quiz?: Quiz
  score: number
  totalPoints: number
  percentage: number
  timeSpent: number
  responses: QuizResponse[]
  completedAt: Date
}

export interface QuizResponse {
  id: string
  attemptId: string
  questionId: string
  selectedAnswerIds: string[]
  isCorrect: boolean
  timeSpent: number
}

// Anatomy Types
export interface AnatomyImage {
  id: string
  title: string
  svgUrl: string
  categoryId: string
  category?: Category
  labels: AnatomyLabel[]
  layers: AnatomyLayer[]
}

export interface AnatomyLabel {
  id: string
  imageId: string
  text: string
  description?: string
  x: number
  y: number
  linkedTermId?: string
}

export interface AnatomyLayer {
  id: string
  imageId: string
  name: string
  svgGroupId: string
  visible: boolean
  order: number
}

// PDF & Document Types
export interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: 'pdf' | 'image' | 'svg'
  categoryId: string
  category?: Category
  authorId: string
  author?: User
  pageCount?: number
  yearLevel?: YearLevel
  createdAt: Date
}

export type AnnotationType = 'highlight' | 'note' | 'bookmark'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

export interface PdfAnnotation {
  id: string
  documentId: string
  userId: string
  type: AnnotationType
  page: number
  content?: string
  color?: HighlightColor
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  createdAt: Date
}

// Moderation Types
export type ModerationAction = 'approve' | 'reject' | 'request_changes'

export interface ModerationEntry {
  id: string
  contentType: 'flashcard' | 'deck' | 'quiz'
  contentId: string
  submittedBy: string
  submitter?: User
  reviewedBy?: string
  reviewer?: User
  action?: ModerationAction
  feedback?: string
  submittedAt: Date
  reviewedAt?: Date
}

// Navigation
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}
