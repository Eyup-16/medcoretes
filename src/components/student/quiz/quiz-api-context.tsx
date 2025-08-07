// @ts-nocheck
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo } from 'react';
import { useQuizAnswerSubmission } from '@/hooks/use-quiz-api';
import { QuizService } from '@/lib/api-services';
import { quizStorage, QuizSessionState, QuizAnswer } from '@/lib/quiz-storage';
import { toast } from 'sonner';
import { debounce } from 'lodash';

// Re-export types from the original context for compatibility
export type {
  QuizQuestion,
  UserAnswer,
  QuizSession,
  QuizTimer,
} from './quiz-context';

// Enhanced quiz state with API integration and client-side storage
interface ApiQuizState {
  session: any; // QuizSession from original context
  timer: any; // QuizTimer from original context
  currentQuestion: any | null; // QuizQuestion from original context, can be null
  isAnswerRevealed: boolean;
  showExplanation: boolean;
  sidebarOpen: boolean;
  // API-specific state
  apiSessionId?: number;
  submittingAnswer: boolean;
  lastSubmissionError: string | null;
  autoSave: boolean;
  // Client-side storage state
  clientStorageEnabled: boolean;
  pendingSubmission: boolean;
  localAnswers: Record<number, QuizAnswer>;
}

// Enhanced quiz actions with API integration
type ApiQuizAction =
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'GO_TO_QUESTION'; questionIndex: number }
  | { type: 'SUBMIT_ANSWER'; answer: any; submitToApi?: boolean }
  | { type: 'ANSWER_SUBMITTED'; success: boolean; error?: string }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'TOGGLE_EXPLANATION' }
  | { type: 'PAUSE_QUIZ' }
  | { type: 'RESUME_QUIZ' }
  | { type: 'UPDATE_TIMER'; totalTime: number; questionTime: number }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'BOOKMARK_QUESTION'; questionId: string }
  | { type: 'ADD_NOTE'; questionId: string; note: string }
  | { type: 'FLAG_QUESTION'; questionId: string; flag: 'difficult' | 'review_later' | 'report_error' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SET_AUTO_SAVE'; enabled: boolean }
  | { type: 'CLEAR_SUBMISSION_ERROR' }
  | { type: 'LOAD_LOCAL_ANSWERS'; answers: Record<number, QuizAnswer> }
  | { type: 'SAVE_LOCAL_ANSWER'; answer: QuizAnswer }
  | { type: 'SET_PENDING_SUBMISSION'; pending: boolean };

// Enhanced quiz reducer with API integration
function apiQuizReducer(state: ApiQuizState, action: ApiQuizAction): ApiQuizState {
  switch (action.type) {
    case 'NEXT_QUESTION':
      if (state.session.currentQuestionIndex < state.session.totalQuestions - 1) {
        const nextIndex = state.session.currentQuestionIndex + 1;
        const nextQuestion = state.session.questions?.[nextIndex] || null;
        return {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: nextIndex,
          },
          currentQuestion: nextQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        };
      }
      return state;

    case 'PREVIOUS_QUESTION':
      if (state.session.currentQuestionIndex > 0) {
        const prevIndex = state.session.currentQuestionIndex - 1;
        const prevQuestion = state.session.questions?.[prevIndex] || null;
        return {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: prevIndex,
          },
          currentQuestion: prevQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        };
      }
      return state;

    case 'GO_TO_QUESTION':
      if (action.questionIndex >= 0 && action.questionIndex < state.session.totalQuestions) {
        const targetQuestion = state.session.questions?.[action.questionIndex] || null;
        return {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: action.questionIndex,
          },
          currentQuestion: targetQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        };
      }
      return state;

    case 'SUBMIT_ANSWER':
      if (!state.currentQuestion) {
        console.warn('Cannot submit answer: currentQuestion is undefined');
        return state;
      }

      const currentQuestionId = state.currentQuestion.id;
      const userAnswer = {
        questionId: currentQuestionId,
        timeSpent: state.timer.questionTime,
        timestamp: new Date(),
        ...action.answer,
      };

      // Store answer locally if client storage is enabled
      const newLocalAnswers = state.clientStorageEnabled
        ? { ...state.localAnswers, [currentQuestionId]: userAnswer }
        : state.localAnswers;

      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [currentQuestionId]: userAnswer,
          },
        },
        localAnswers: newLocalAnswers,
        isAnswerRevealed: state.session.showAnswers,
        submittingAnswer: action.submitToApi || false,
        lastSubmissionError: null,
      };

    case 'ANSWER_SUBMITTED':
      return {
        ...state,
        submittingAnswer: false,
        lastSubmissionError: action.success ? null : (action.error || 'Submission failed'),
      };

    case 'REVEAL_ANSWER':
      return {
        ...state,
        isAnswerRevealed: true,
      };

    case 'TOGGLE_EXPLANATION':
      return {
        ...state,
        showExplanation: !state.showExplanation,
      };

    case 'PAUSE_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'paused',
        },
        timer: {
          ...state.timer,
          isPaused: true,
          isRunning: false,
        },
      };

    case 'RESUME_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'active',
        },
        timer: {
          ...state.timer,
          isPaused: false,
          isRunning: true,
        },
      };

    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          totalTime: action.totalTime,
          questionTime: action.questionTime,
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'BOOKMARK_QUESTION':
      const bookmarkAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...bookmarkAnswer,
              isBookmarked: !bookmarkAnswer.isBookmarked,
            },
          },
        },
      };

    case 'ADD_NOTE':
      const noteAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...noteAnswer,
              notes: action.note,
            },
          },
        },
      };

    case 'FLAG_QUESTION':
      const flagAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };
      
      const currentFlags = flagAnswer.flags || [];
      const hasFlag = currentFlags.includes(action.flag);
      const newFlags = hasFlag 
        ? currentFlags.filter(f => f !== action.flag)
        : [...currentFlags, action.flag];
      
      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...flagAnswer,
              flags: newFlags,
            },
          },
        },
      };

    case 'COMPLETE_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'completed',
        },
        timer: {
          ...state.timer,
          isRunning: false,
          isPaused: false,
        },
      };

    case 'SET_AUTO_SAVE':
      return {
        ...state,
        autoSave: action.enabled,
      };

    case 'CLEAR_SUBMISSION_ERROR':
      return {
        ...state,
        lastSubmissionError: null,
      };

    case 'LOAD_LOCAL_ANSWERS':
      return {
        ...state,
        localAnswers: action.answers,
      };

    case 'SAVE_LOCAL_ANSWER':
      return {
        ...state,
        localAnswers: {
          ...state.localAnswers,
          [action.answer.questionId]: action.answer,
        },
      };

    case 'SET_PENDING_SUBMISSION':
      return {
        ...state,
        pendingSubmission: action.pending,
      };

    default:
      return state;
  }
}

// Enhanced context type with API integration
interface ApiQuizContextType {
  state: ApiQuizState;
  dispatch: React.Dispatch<ApiQuizAction>;
  // Helper functions
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitAnswer: (answer: any, submitToApi?: boolean) => Promise<void>;
  revealAnswer: () => void;
  toggleExplanation: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  toggleSidebar: () => void;
  bookmarkQuestion: (questionId: string) => void;
  addNote: (questionId: string, note: string) => void;
  flagQuestion: (questionId: string, flag: 'difficult' | 'review_later' | 'report_error') => void;
  completeQuiz: () => void;
  submitAllAnswers: () => Promise<boolean>;
  setAutoSave: (enabled: boolean) => void;
  clearSubmissionError: () => void;
  retrySubmission: () => Promise<void>;
  getStorageStats: () => any;
}

const ApiQuizContext = createContext<ApiQuizContextType | undefined>(undefined);

// Enhanced provider with API integration
interface ApiQuizProviderProps {
  children: React.ReactNode;
  initialSession: any;
  apiSessionId?: number;
  enableApiSubmission?: boolean;
}

export function ApiQuizProvider({
  children,
  initialSession,
  apiSessionId,
  enableApiSubmission = true
}: ApiQuizProviderProps) {
  const initialState: ApiQuizState = {
    session: initialSession,
    timer: {
      totalTime: 0,
      questionTime: 0,
      isPaused: false,
      isRunning: true,
    },
    currentQuestion: initialSession.questions?.[initialSession.currentQuestionIndex] || null,
    isAnswerRevealed: false,
    showExplanation: false,
    sidebarOpen: true,
    apiSessionId,
    submittingAnswer: false,
    lastSubmissionError: null,
    autoSave: false, // Disable auto-save for client-side storage
    clientStorageEnabled: true,
    pendingSubmission: false,
    localAnswers: {},
  };

  const [state, dispatch] = useReducer(apiQuizReducer, initialState);
  const { submitAnswer: apiSubmitAnswer, submitting } = useQuizAnswerSubmission();

  // Initialize client-side storage for the session
  useEffect(() => {
    if (apiSessionId && state.clientStorageEnabled) {
      // Load existing session state from storage
      const storedSession = quizStorage.loadSessionState(apiSessionId);

      if (storedSession) {
        // Load stored answers
        dispatch({ type: 'LOAD_LOCAL_ANSWERS', answers: storedSession.answers });
        console.log(`📖 Loaded ${Object.keys(storedSession.answers).length} answers from client storage`);
      } else {
        // Initialize new session in storage
        const sessionState: QuizSessionState = {
          sessionId: apiSessionId,
          title: initialSession.title || 'Quiz Session',
          type: initialSession.type || 'PRACTICE',
          status: 'IN_PROGRESS',
          currentQuestionIndex: initialSession.currentQuestionIndex || 0,
          totalQuestions: initialSession.totalQuestions || initialSession.questions?.length || 0,
          answers: {},
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
          timeSpent: 0,
          bookmarkedQuestions: [],
          flaggedQuestions: [],
          settings: {
            showExplanations: initialSession.showExplanations || 'after_each',
            timeLimit: initialSession.timeLimit,
            shuffleQuestions: initialSession.shuffleQuestions || false,
          },
        };

        quizStorage.saveSessionState(sessionState);
        console.log(`💾 Initialized new session ${apiSessionId} in client storage`);
      }
    }
  }, [apiSessionId, state.clientStorageEnabled, initialSession]);

  // Answer batching state for optimized submissions
  const [pendingAnswers, setPendingAnswers] = useState<Array<{
    questionId: number;
    selectedAnswerId: number;
    timeSpent?: number;
    timestamp: Date;
  }>>([]);

  // Track submission status for better UX
  const [batchSubmissionStatus, setBatchSubmissionStatus] = useState<{
    isSubmitting: boolean;
    lastSubmissionTime: number | null;
    failedAnswers: number[];
  }>({
    isSubmitting: false,
    lastSubmissionTime: null,
    failedAnswers: []
  });

  // Helper functions
  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const previousQuestion = useCallback(() => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_QUESTION', questionIndex: index });
  }, []);

  // Legacy batch submission - DISABLED for manual submission flow
  const submitAnswersBatch = useCallback(async (answersToSubmit: any[]) => {
    console.log('⚠️ Legacy batch submission called - this should not happen in manual submission mode');
    // This function is disabled to prevent auto-submission
    return;
  }, []);

  // Legacy debounced batch submission - DISABLED
  const debouncedBatchSubmit = useMemo(
    () => ({
      cancel: () => {}, // No-op function
      flush: () => {}, // No-op function
    }),
    []
  );

  const submitAnswer = useCallback(async (answer: any) => {
    // Check if session is completed - prevent submission
    if (state.session.status === 'completed' || state.session.status === 'COMPLETED') {
      console.warn('Cannot submit answer: Quiz session is already completed');
      toast.error('Cannot submit answer: Quiz session is already completed');
      return;
    }

    // Only save to local state and client storage - NO API submission
    dispatch({ type: 'SUBMIT_ANSWER', answer, submitToApi: false });

    // Save to client-side storage
    if (state.clientStorageEnabled && apiSessionId && state.currentQuestion) {
      const selectedAnswerId = answer.selectedOptions?.[0];
      const quizAnswer: QuizAnswer = {
        questionId: parseInt(state.currentQuestion.id),
        selectedAnswerId: selectedAnswerId ? parseInt(selectedAnswerId) : undefined,
        selectedAnswerIds: answer.selectedOptions?.map((id: string) => parseInt(id)),
        textAnswer: answer.textAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: state.timer.questionTime,
        timestamp: new Date(),
        flags: answer.flags || [],
        notes: answer.notes,
      };

      // Save answer to client storage
      quizStorage.saveAnswer(apiSessionId, quizAnswer);

      // Update local state
      dispatch({ type: 'SAVE_LOCAL_ANSWER', answer: quizAnswer });

      console.log(`💾 Answer saved to client storage (Question ${quizAnswer.questionId})`);
      toast.success('Answer saved', { duration: 1000 });
    }

    // Mark as submitted locally (no API call)
    dispatch({ type: 'ANSWER_SUBMITTED', success: true });
  }, [state.clientStorageEnabled, state.currentQuestion?.id, state.timer.questionTime, apiSessionId]);

  const revealAnswer = useCallback(() => {
    dispatch({ type: 'REVEAL_ANSWER' });
  }, []);

  const toggleExplanation = useCallback(() => {
    dispatch({ type: 'TOGGLE_EXPLANATION' });
  }, []);

  const pauseQuiz = useCallback(() => {
    dispatch({ type: 'PAUSE_QUIZ' });
  }, []);

  const resumeQuiz = useCallback(() => {
    dispatch({ type: 'RESUME_QUIZ' });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const bookmarkQuestion = useCallback((questionId: string) => {
    dispatch({ type: 'BOOKMARK_QUESTION', questionId });
  }, []);

  const addNote = useCallback((questionId: string, note: string) => {
    dispatch({ type: 'ADD_NOTE', questionId, note });
  }, []);

  // Legacy flush pending answers - DISABLED for manual submission flow
  const flushPendingAnswers = useCallback(async () => {
    console.log('⚠️ Legacy flushPendingAnswers called - this should not happen in manual submission mode');
    // This function is disabled to prevent auto-submission
    return;
  }, []);

  // Manual quiz submission - only when user explicitly submits
  const submitAllAnswers = useCallback(async () => {
    if (!apiSessionId) {
      console.error('Cannot submit quiz: No session ID');
      return false;
    }

    try {
      dispatch({ type: 'SET_PENDING_SUBMISSION', pending: true });

      // Mark session as completed in client storage
      const completedSession = quizStorage.completeSession(apiSessionId);
      if (!completedSession) {
        throw new Error('Failed to complete session in client storage');
      }

      // Get all answers for submission
      const answersForSubmission = quizStorage.getAnswersForSubmission(apiSessionId);

      if (answersForSubmission.length === 0) {
        console.warn('No answers to submit');
        toast.warning('No answers to submit');
        return false;
      }

      console.log(`📤 Submitting ${answersForSubmission.length} answers to server...`);
      toast.loading('Submitting your answers...', { id: 'quiz-submission' });

      // Convert to API format and submit
      const apiAnswers = answersForSubmission.map(answer => ({
        questionId: answer.questionId,
        selectedAnswerId: answer.selectedAnswerId,
        timeSpent: answer.timeSpent,
      })).filter(answer => answer.selectedAnswerId); // Only submit answers with selections

      if (apiAnswers.length > 0) {
        const response = await QuizService.submitAnswersBulk(apiSessionId, apiAnswers);

        if (!response.success) {
          throw new Error(response.error || 'Failed to submit answers');
        }
      }

      // Update local state to completed
      dispatch({ type: 'COMPLETE_QUIZ' });

      // Clean up client storage after successful submission
      quizStorage.removeSessionState(apiSessionId);

      toast.success('Quiz submitted successfully!', { id: 'quiz-submission' });
      console.log(`✅ Quiz ${apiSessionId} submitted successfully`);

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
      console.error('Quiz submission error:', error);
      toast.error(`Failed to submit quiz: ${errorMessage}`, { id: 'quiz-submission' });

      // Keep answers in storage for retry
      toast.info('Your answers are saved locally. You can try submitting again.');
      return false;
    } finally {
      dispatch({ type: 'SET_PENDING_SUBMISSION', pending: false });
    }
  }, [apiSessionId]);

  // Legacy completion function - now just marks as ready for submission
  const completeQuiz = useCallback(async () => {
    // Just mark the quiz as ready for submission, don't auto-submit
    if (apiSessionId) {
      quizStorage.completeSession(apiSessionId);
      dispatch({ type: 'COMPLETE_QUIZ' });
      console.log(`✅ Quiz ${apiSessionId} marked as ready for submission`);
    }
  }, [apiSessionId]);

  const flagQuestion = useCallback((questionId: string, flag: 'difficult' | 'review_later' | 'report_error') => {
    dispatch({ type: 'FLAG_QUESTION', questionId, flag });
  }, []);



  const setAutoSave = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_SAVE', enabled });
  }, []);

  const clearSubmissionError = useCallback(() => {
    dispatch({ type: 'CLEAR_SUBMISSION_ERROR' });
  }, []);

  // Retry submission of stored answers
  const retrySubmission = useCallback(async () => {
    if (!apiSessionId) return;

    const storedSession = quizStorage.loadSessionState(apiSessionId);
    if (!storedSession || storedSession.status !== 'COMPLETED') {
      console.log('No completed session found for retry');
      return;
    }

    try {
      await completeQuiz();
    } catch (error) {
      console.error('Retry submission failed:', error);
    }
  }, [apiSessionId, completeQuiz]);

  // Get client storage statistics
  const getStorageStats = useCallback(() => {
    return quizStorage.getStorageStats();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!state.timer.isRunning || state.timer.isPaused) return;

    const interval = setInterval(() => {
      dispatch({ 
        type: 'UPDATE_TIMER', 
        totalTime: state.timer.totalTime + 1,
        questionTime: state.timer.questionTime + 1
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timer.isRunning, state.timer.isPaused, state.timer.totalTime, state.timer.questionTime]);

  const value: ApiQuizContextType = {
    state,
    dispatch,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitAnswer,
    revealAnswer,
    toggleExplanation,
    pauseQuiz,
    resumeQuiz,
    toggleSidebar,
    bookmarkQuestion,
    addNote,
    flagQuestion,
    completeQuiz,
    submitAllAnswers,
    setAutoSave,
    clearSubmissionError,
    retrySubmission,
    getStorageStats,
    // Legacy compatibility
    flushPendingAnswers,
    batchSubmissionStatus,
    pendingAnswersCount: Object.keys(state.localAnswers).length,
  };

  return (
    <ApiQuizContext.Provider value={value}>
      {children}
    </ApiQuizContext.Provider>
  );
}

// Hook to use the enhanced quiz context
export function useApiQuiz() {
  const context = useContext(ApiQuizContext);
  if (context === undefined) {
    throw new Error('useApiQuiz must be used within an ApiQuizProvider');
  }
  return context;
}

// Export the API-only useQuiz hook - no fallback to ensure API-only usage
export function useQuiz() {
  return useApiQuiz();
}
