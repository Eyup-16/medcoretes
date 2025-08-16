// @ts-nocheck
/**
 * API Types
 * Based on actual API responses from the Medical Education Platform
 */

import { User, AuthTokens, ApiError, CurrentYear } from './auth';

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Login request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  tokens: AuthTokens;
}

// Refresh token types
export interface RefreshTokenRequest {
  refreshToken: string;
}

// API User type (same as User from auth.ts)
export type ApiUser = User;

// Settings-specific types based on actual API responses
export interface University {
  id: number;
  name: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    quizzes: number;
    questions: number;
    exams: number;
  };
}

export interface Specialty {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface UserSubscription {
  id: number;
  userId: number;
  studyPackId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
  studyPack: {
    id: number;
    name: string;
    description: string;
    type: 'YEAR' | 'COURSE' | 'SPECIALTY';
    yearNumber: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Enhanced User Profile type based on actual API response
export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN' | 'EMPLOYEE';
  universityId: number;
  specialtyId: number;
  currentYear: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN';
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  university: University;
  specialty: Specialty;
  subscriptions: UserSubscription[];
}

// Profile update request type
export interface ProfileUpdateRequest {
  fullName?: string;
  universityId?: number;
  specialtyId?: number;
  currentYear?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN';
}

// Universities response type
export interface UniversitiesResponse {
  universities: University[];
}

// Specialties response type
export interface SpecialtiesResponse {
  specialties: Specialty[];
}

// Student Dashboard Performance - Updated to match actual API response
export interface StudentDashboardPerformance {
  improvementTrend: number;
  studyStreak: number;
  weeklyStats: WeeklyStats[];
  recentActivity: RecentActivity[];
  subjectPerformance: SubjectPerformance[];
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

// Weekly stats from actual API response
export interface WeeklyStats {
  week: string;
  sessionsCompleted: number;
  averageScore: number;
}

// Weekly performance data
export interface WeeklyPerformanceData {
  week: string;
  questionsAnswered: number;
  accuracy: number;
  timeSpent: number;
}

// Recent activity data (from dashboard performance API)
export interface RecentActivity {
  date: string;
  activity: string;
  score: number;
  type: string;
  subject: string;
}

// Legacy RecentSession interface for backward compatibility
export interface RecentSession {
  id: number;
  date: string;
  questionsAnswered: number;
  accuracy: number;
  timeSpent: number;
  studyPackName: string;
}

// Subject performance data (from dashboard performance API)
export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalSessions: number;
  bestScore: number;
  worstScore: number;
}

// Study Pack types
export interface StudyPack {
  id: number;
  name: string;
  description: string;
  type: 'YEAR' | 'RESIDENCY';
  yearNumber: CurrentYear | null;
  price: number;
  isActive: boolean;
  totalQuestions: number;
  subjects: string[];
  createdAt: string;
  updatedAt: string;
  statistics?: {
    totalQuestions: number;
    totalQuizzes: number;
    totalCourses: number;
    totalModules: number;
    totalUnits: number; // Fixed typo from totalUnites
    subscribersCount: number;
  };
}

export interface StudyPackDetails extends StudyPack {
  unites?: StudyPackUnit[];
  questions?: QuizQuestion[];
  userProgress?: {
    completedQuestions: number;
    accuracy: number;
    timeSpent: number;
  };
}

export interface StudyPackUnit {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
  modules: StudyPackModule[];
}

export interface StudyPackModule {
  id: number;
  name: string;
  description: string;
  courses: StudyPackCourse[];
  statistics?: {
    questionsCount: number;
    quizzesCount: number;
    coursesCount: number;
  };
}

export interface StudyPackCourse {
  id: number;
  name: string;
  description: string;
  statistics?: {
    questionsCount: number;
    quizzesCount: number;
  };
}

// Quiz and Question types - Based on actual API response
export interface QuizQuestion {
  id: number;
  questionText: string;
  explanation: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  answerText: string;
  isCorrect: boolean;
  explanation: string;
  explanationImages: ExplanationImage[];
}

export interface ExplanationImage {
  id: number;
  imagePath: string;
  altText: string;
}

// Quiz Session - Based on actual API response
export interface QuizSession {
  id: number;
  title: string;
  type: 'PRACTICE' | 'EXAM';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score: number;
  percentage: number;
  questions: QuizQuestion[];
  answers: any[]; // User answers
  createdAt: string;
  updatedAt: string;
}

// Quiz Filters - Based on actual API response
export interface QuizFilters {
  availableYears: string[];
  unites: QuizUnit[];
}

export interface QuizUnit {
  id: number;
  name: string;
  year: string;
  modules: QuizModule[];
}

export interface QuizModule {
  id: number;
  name: string;
  courses: QuizCourse[];
}

export interface QuizCourse {
  id: number;
  name: string;
  questionCount: number;
}

// Legacy quiz filters interface for backward compatibility
export interface LegacyQuizFilters {
  studyPackId?: number;
  subject?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  limit?: number;
  offset?: number;
}

// Additional types expected by the quiz hooks (need to be mapped from API response)
export interface YearLevel {
  value: string;
  name: string;
}

export interface QuizTopic {
  id: number;
  name: string;
  courseId: number;
}

export interface QuizDifficulty {
  value: string;
  name: string;
}

// User Subscription types
export interface UserSubscription {
  id: number;
  userId: number;
  studyPackId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
  studyPack: StudyPack;
}

// Progress tracking types
export interface ProgressOverview {
  totalQuestions: number;
  completedQuestions: number;
  accuracy: number;
  timeSpent: number;
  lastActivity: string;
}

export interface CourseProgressDetails {
  studyPackId: number;
  studyPackName: string;
  progress: ProgressOverview;
  subjectProgress: SubjectPerformance[];
}

export interface CourseProgressUpdate {
  studyPackId: number;
  questionId: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface CourseProgressResponse {
  message: string;
  updatedProgress: ProgressOverview;
}

// Exam types - Updated to match actual API response
export interface Exam {
  id: number;
  title: string;
  description?: string;
  yearLevel: string;
  examYear: string;
  university?: {
    id: number;
    name: string;
  } | string;
  // Additional properties that might be available in full exam details
  studyPackId?: number;
  questionCount?: number;
  questionsCount?: number;
  timeLimit?: number; // in minutes
  duration?: number;
  totalQuestions?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  passingScore?: number;
  maxAttempts?: number;
  instructions?: string;
  rules?: string[];
  prerequisites?: string[];
  universityName?: string;
  canAccess?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSession {
  id: number;
  title: string;
  type: 'EXAM' | 'QUIZ' | 'PRACTICE';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  score: number;
  percentage: number;
  questions: SessionQuestion[];
  answers: SessionAnswer[];
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  examId?: number;
  userId?: number;
  startTime?: string;
  endTime?: string;
}

export interface SessionQuestion {
  id: number;
  questionText: string;
  explanation: string;
  answers: SessionQuestionAnswer[];
}

export interface SessionQuestionAnswer {
  id: number;
  answerText: string;
  isCorrect: boolean;
  explanation: string;
  explanationImages: ExplanationImage[];
}

export interface ExplanationImage {
  id: number;
  imagePath: string;
  altText: string;
}

export interface SessionAnswer {
  questionId: number;
  selectedAnswerId?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

// Legacy interface for backward compatibility
export interface ExamAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

// ExamQuestion now uses the same structure as QuizQuestion from API
export interface ExamQuestion extends QuizQuestion {
  // Exam questions have the same structure as quiz questions
}

export interface ExamResult {
  sessionId: number;
  examId: number;
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  totalTime: number;
  completedAt: string;
}

// Exam types - Based on actual API response
export interface AvailableExamsResponse {
  examsByYear: ExamsByYear[];
  residencyExams: ResidencyExams;
}

export interface ExamsByYear {
  year: string;
  exams: ExamInfo[];
}

export interface ExamInfo {
  id: number;
  title: string;
  university: string;
  yearLevel: string;
}

export interface ResidencyExams {
  available: boolean;
  yearsAvailable: string[];
  exams: ExamInfo[];
}

export interface ExamFilters {
  universityId?: number;
  yearLevel?: string;
  examYear?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// Session Results types
export interface SessionResult {
  id: number;
  userId: number;
  studyPackId: number;
  studyPackName: string;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
  createdAt: string;
}

export interface SessionResultsFilters {
  studyPackId?: number;
  startDate?: string;
  endDate?: string;
  minAccuracy?: number;
  maxAccuracy?: number;
  limit?: number;
  offset?: number;
  // Extended filters to match actual API endpoints
  answerType?: 'all' | 'correct' | 'incorrect';
  sessionType?: 'PRACTICE' | 'EXAM';
  sessionIds?: string; // Comma-separated list of session IDs
  completedAfter?: string; // ISO date string
  completedBefore?: string; // ISO date string
  page?: number;
}

// Advanced analytics filters for enhanced functionality
export interface AdvancedSessionFilters extends SessionResultsFilters {
  subjects?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
  performanceThreshold?: number;
  includeAbandoned?: boolean;
}

// Session comparison types
export interface SessionComparison {
  sessions: SessionSummary[];
  metrics: ComparisonMetrics;
  insights: string[];
}

export interface SessionSummary {
  sessionId: number;
  title: string;
  type: 'PRACTICE' | 'EXAM';
  completedAt: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  subject?: string;
}

export interface ComparisonMetrics {
  accuracyImprovement: number;
  speedImprovement: number;
  consistencyScore: number;
  strengthAreas: string[];
  weaknessAreas: string[];
}

// Time-based analytics
export interface TimeBasedAnalytics {
  dailyPerformance: DailyPerformance[];
  weeklyTrends: WeeklyTrend[];
  monthlyProgress: MonthlyProgress[];
  studyPatterns: StudyPattern[];
}

// Admin Dashboard Stats - Based on /admin/dashboard/stats API response
export interface DashboardStats {
  users: {
    total: number;
    students: number;
    employees: number;
    admins: number;
    newThisMonth: number;
  };
  content: {
    totalQuizzes: number;
    totalExams: number;
    totalQuestions: number;
    totalSessions: number;
  };
  activity: {
    activeUsers: number;
    sessionsToday: number;
    averageSessionScore: number;
  };
  subscriptions: {
    active: number;
    expired: number;
    revenue: number;
  };
}

// Admin Subscription Management Types
export interface AdminSubscription {
  id: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  studyPack: {
    id: number;
    name: string;
    type: 'YEAR' | 'RESIDENCY';
    yearNumber: string | null;
    price: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionFilters {
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  studyPackId?: number;
  userId?: number;
  search?: string;
}

export interface UpdateSubscriptionRequest {
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  endDate?: string;
}

export interface CancelSubscriptionRequest {
  reason: string;
}

export interface AddMonthsToSubscriptionRequest {
  months: number;
  reason: string;
}

// Admin Quiz Management Types
export interface AdminQuiz {
  id: number;
  title: string;
  description: string;
  type: 'QCM' | 'QCS' | 'PRACTICE' | 'EXAM';
  courseId: number;
  universityId: number;
  yearLevel: string;
  quizSourceId: number;
  quizYear: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    name: string;
  };
  university?: {
    id: number;
    name: string;
  };
  questions?: AdminQuizQuestion[];
  _count?: {
    questions: number;
    sessions: number;
  };
}

export interface AdminQuizQuestion {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  explanation: string;
  answers: AdminQuizAnswer[];
}

export interface AdminQuizAnswer {
  id?: number;
  answerText: string;
  isCorrect: boolean;
  explanation: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  type: 'QCM' | 'QCS' | 'PRACTICE' | 'EXAM';
  courseId: number;
  universityId: number;
  yearLevel: string;
  quizSourceId: number;
  quizYear: number;
  questions: AdminQuizQuestion[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  type?: 'QCM' | 'QCS' | 'PRACTICE' | 'EXAM';
  courseId?: number;
  universityId?: number;
  yearLevel?: string;
  quizSourceId?: number;
  quizYear?: number;
  isActive?: boolean;
}

export interface AdminQuizFilters {
  type?: 'QCM' | 'QCS' | 'PRACTICE' | 'EXAM';
  courseId?: number;
  universityId?: number;
  yearLevel?: string;
  quizSourceId?: number;
  quizYear?: number;
  isActive?: boolean;
  search?: string;
}

// Admin Exam Management Types
export interface AdminExam {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  universityId: number;
  yearLevel: string;
  examYear: string;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: number;
    name: string;
  };
  university?: {
    id: number;
    name: string;
  };
  questions?: AdminExamQuestion[];
  _count?: {
    questions: number;
    sessions: number;
  };
}

export interface AdminExamQuestion {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  explanation: string;
  orderInExam: number;
  answers: AdminQuizAnswer[];
}

export interface CreateExamRequest {
  title: string;
  description: string;
  moduleId: number;
  universityId: number;
  yearLevel: string;
  examYear: string;
  year: number;
  questions: AdminExamQuestion[];
}

export interface UpdateExamRequest {
  title?: string;
  description?: string;
  moduleId?: number;
  universityId?: number;
  yearLevel?: string;
  examYear?: string;
  year?: number;
  isActive?: boolean;
}

export interface AdminExamFilters {
  moduleId?: number;
  universityId?: number;
  yearLevel?: string;
  examYear?: string;
  year?: number;
  isActive?: boolean;
  search?: string;
}

export interface UpdateExamQuestionOrderRequest {
  examId: number;
  questionOrders: Array<{
    questionId: number;
    orderInExam: number;
  }>;
}

// Admin Question Reports Management Types
export interface AdminQuestionReport {
  id: number;
  questionId: number;
  userId: number;
  reportType: 'INCORRECT_ANSWER' | 'UNCLEAR_QUESTION' | 'TYPO' | 'OTHER';
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  response?: string;
  action?: 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  question: {
    id: number;
    questionText: string;
    questionType: string;
  };
  reviewer?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface AdminQuestionReportFilters {
  status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reportType?: 'INCORRECT_ANSWER' | 'UNCLEAR_QUESTION' | 'TYPO' | 'OTHER';
  questionId?: number;
  userId?: number;
  search?: string;
}

export interface ReviewQuestionReportRequest {
  response: string;
  action: 'RESOLVED' | 'DISMISSED';
}

// Admin Activation Codes Management Types
export interface ActivationCode {
  id: number;
  code: string;
  description?: string;
  durationMonths: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  studyPacks: Array<{
    studyPack: {
      id: number;
      name: string;
      type?: 'YEAR' | 'COURSE' | 'SPECIALTY';
      yearNumber?: string;
    };
  }>;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface CreateActivationCodeRequest {
  description?: string;
  durationMonths: number;
  maxUses: number;
  expiresAt: string;
  studyPackIds: number[];
}

export interface ActivationCodeFilters {
  isActive?: boolean;
  search?: string;
  createdBy?: number;
}

// Admin Question Management Types
export interface AdminQuestion {
  id: number;
  questionText: string;
  explanation?: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  courseId: number;
  examId?: number;
  universityId?: number;
  yearLevel?: string;
  examYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    name: string;
    module?: {
      id: number;
      name: string;
      unite?: {
        id: number;
        name: string;
        studyPack?: {
          id: number;
          name: string;
        };
      };
    };
  };
  university?: {
    id: number;
    name: string;
    country: string;
  };
  exam?: {
    id: number;
    title: string;
  };
  answers: AdminQuestionAnswer[];
  questionImages?: Array<{
    id: number;
    imagePath: string;
    altText?: string;
  }>;
  _count?: {
    reports: number;
    sessions: number;
  };
}

export interface AdminQuestionAnswer {
  id?: number;
  answerText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface AdminQuestionFilters {
  courseId?: number;
  universityId?: number;
  examId?: number;
  questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  yearLevel?: string;
  examYear?: number;
  isActive?: boolean;
  search?: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  explanation?: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  courseId: number;
  examId?: number;
  universityId?: number;
  yearLevel?: string;
  examYear?: number;
  questionImages?: Array<{ imagePath: string; altText?: string }>;
  answers: Array<{
    answerText: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  explanation?: string;
  questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  courseId?: number;
  examId?: number;
  universityId?: number;
  yearLevel?: string;
  examYear?: number;
  questionImages?: Array<{ imagePath: string; altText?: string }>;
  answers?: Array<{
    id?: number;
    answerText: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  isActive?: boolean;
}

export interface UpdateQuestionExplanationRequest {
  explanation: string;
  explanationImages?: File[];
}

// Admin File Upload Types
export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface ImageUploadResponse {
  success: boolean;
  files: UploadedFile[];
  message: string;
}

export interface PDFUploadResponse {
  success: boolean;
  files: UploadedFile[];
  message: string;
}

export interface StudyPackMediaUploadResponse {
  success: boolean;
  files: {
    images: UploadedFile[];
    pdfs: UploadedFile[];
  };
  message: string;
}

export interface ExplanationUploadResponse {
  success: boolean;
  files: UploadedFile[];
  message: string;
}

export interface LogoUploadResponse {
  success: boolean;
  files: UploadedFile[];
  message: string;
}

// File upload error types
export interface FileUploadError {
  success: false;
  error: string;
}

export interface DailyPerformance {
  date: string;
  sessionsCompleted: number;
  questionsAnswered: number;
  averageAccuracy: number;
  totalTimeSpent: number;
}

export interface WeeklyTrend {
  weekStart: string;
  weekEnd: string;
  sessionsCompleted: number;
  averageAccuracy: number;
  improvementRate: number;
  consistencyScore: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  totalSessions: number;
  averageAccuracy: number;
  topSubjects: string[];
  goalsAchieved: number;
}

export interface StudyPattern {
  timeOfDay: string;
  dayOfWeek: string;
  averageAccuracy: number;
  averageSessionDuration: number;
  frequency: number;
}

// Question Report types
export interface QuestionReport {
  id: number;
  questionId: number;
  userId: number;
  reportType: 'INCORRECT_ANSWER' | 'UNCLEAR_QUESTION' | 'TECHNICAL_ISSUE' | 'OTHER';
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  question: QuizQuestion;
}

export interface QuestionReportRequest {
  questionId: number;
  reportType: 'INCORRECT_ANSWER' | 'UNCLEAR_QUESTION' | 'TECHNICAL_ISSUE' | 'OTHER';
  description: string;
}

export interface QuestionReportResponse {
  message: string;
  reportId: number;
}

export interface QuestionReportsFilters {
  questionId?: number;
  reportType?: 'INCORRECT_ANSWER' | 'UNCLEAR_QUESTION' | 'TECHNICAL_ISSUE' | 'OTHER';
  status?: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  limit?: number;
  offset?: number;
}
