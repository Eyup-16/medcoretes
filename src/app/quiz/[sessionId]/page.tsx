// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuizLayout } from '@/components/student/quiz/quiz-layout';
import { QuizProvider } from '@/components/student/quiz/quiz-context';
import { ApiQuizProvider } from '@/components/student/quiz/quiz-api-context';

import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary, ApiError } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';



export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.sessionId as string);

  // Note: Authentication is now handled by the layout, so we don't need to check here

  // API integration
  const { session: apiSession, loading: sessionLoading, error: sessionError, refresh } = useQuizSession(sessionId);

  const [quizSession, setQuizSession] = useState<any>(null);

  // Set quiz/exam session from API data when available (unified handling)
  useEffect(() => {
    if (apiSession) {
      // Handle nested response structure from unified API
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;
      const sessionType = sessionData.type || 'PRACTICE';

      // Check if session is completed and redirect to results
      if (sessionData.status === 'COMPLETED') {
        console.log(`${sessionType} session is completed, redirecting to results...`);
        router.push(`/student/quiz/results/${sessionId}`);
        return;
      }

      const transformedSession = {
        ...sessionData,
        // Add default settings if not present
        settings: sessionData.settings || {
          showTimer: true,
          allowPause: true,
          showProgress: true,
          randomizeOptions: false,
        },
        // Ensure required properties exist
        currentQuestionIndex: sessionData.currentQuestionIndex || 0,
        totalQuestions: sessionData.questions?.length || 0,
        userAnswers: sessionData.userAnswers || {},
        subject: sessionData.subject || (sessionType === 'EXAM' ? 'Exam' : 'General'),
        unit: sessionData.unit || (sessionType === 'EXAM' ? 'Exam Session' : 'Practice'),
        // Ensure status is properly set - map API status to internal status
        status: sessionData.status === 'COMPLETED' ? 'completed' :
                sessionData.status === 'IN_PROGRESS' ? 'active' :
                sessionData.status || 'active',
        // Ensure questions array exists
        questions: sessionData.questions || [],
        // Preserve session type for proper handling
        type: sessionType,
      };

      console.log('Transformed session:', transformedSession); // Debug log
      setQuizSession(transformedSession);
    }
  }, [apiSession, router, sessionId]);

  // Loading states (authentication is handled by layout)
  if (sessionLoading) {
    return <FullPageLoading message="Loading quiz session..." />;
  }

  // Error state with fallback option
  if (sessionError && !quizSession) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <div className="text-center space-y-8 animate-fade-in-up">
              {/* Error Icon */}
              <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>

              {/* Error Content */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Quiz Session Error
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Unable to load the quiz session from the server. Please try again or return to practice.
                </p>
              </div>

              {/* API Error Component */}
              <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
                <ApiError
                  error={sessionError}
                  onRetry={refresh}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={refresh}
                  className="btn-modern focus-ring"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/student/practice')}
                  className="btn-modern focus-ring"
                >
                  Go to Practice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Session not found or not properly transformed
  if (!quizSession || !quizSession.settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center space-y-8 animate-fade-in-up">
            {/* Status Icon */}
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
                {!quizSession ? (
                  <span className="text-2xl">🔍</span>
                ) : (
                  <span className="text-2xl">⏳</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {!quizSession ? 'Session Not Found' : 'Loading Quiz Session...'}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                {!quizSession
                  ? "The quiz session you're looking for doesn't exist or may have been removed."
                  : "Please wait while we prepare your quiz session. This should only take a moment."
                }
              </p>
            </div>

            {/* Loading indicator for session preparation */}
            {quizSession && !quizSession.settings && (
              <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Preparing session...</span>
                </div>
              </div>
            )}

            {/* Action Buttons - only show for not found case */}
            {!quizSession && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/sessions')}
                  className="btn-modern focus-ring"
                >
                  Back to Sessions
                </Button>
                <Button
                  onClick={() => router.push('/student/practice')}
                  className="btn-modern focus-ring"
                >
                  Go to Practice
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should use API integration
  const useApiIntegration = !isNaN(sessionId) && apiSession;

  return (
    <>
      {useApiIntegration ? (
        <ApiQuizProvider
          initialSession={quizSession}
          apiSessionId={sessionId}
          enableApiSubmission={false}
        >
          <QuizLayout />
        </ApiQuizProvider>
      ) : (
        <QuizProvider initialSession={quizSession}>
          <QuizLayout />
        </QuizProvider>
      )}
    </>
  );
}
