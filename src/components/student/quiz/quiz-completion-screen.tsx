/**
 * Quiz Completion Screen Component
 * 
 * Displays when user has answered all questions and provides manual submission.
 * Shows summary of answers and allows user to review before final submission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useApiQuiz } from './quiz-api-context';
import { SessionTypeIndicator } from './session-type-indicator';
import { cn } from '@/lib/utils';

export function QuizCompletionScreen() {
  const router = useRouter();
  const { state, submitAllAnswers, getStorageStats } = useApiQuiz();
  const { session, timer, localAnswers, pendingSubmission, apiSessionId } = state;
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  // Update storage stats
  useEffect(() => {
    const stats = getStorageStats();
    setStorageStats(stats);
  }, [getStorageStats]);

  const answeredQuestions = Object.keys(localAnswers).length;
  const totalQuestions = session.totalQuestions || session.questions?.length || 0;
  const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswers = async () => {
    setSubmissionAttempted(true);
    const success = await submitAllAnswers();
    
    if (success && apiSessionId) {
      // Redirect to results page after successful submission
      router.push(`/student/quiz/results/${apiSessionId}`);
    }
  };

  const handleReviewAnswers = () => {
    // Go back to review mode - this would need to be implemented
    // For now, just close the completion screen
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
        <p className="text-muted-foreground mb-4">
          You have finished answering all questions. Review your answers and submit when ready.
        </p>
        <SessionTypeIndicator 
          type={session.type || 'PRACTICE'} 
          variant="detailed"
          className="max-w-md mx-auto"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Questions Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {answeredQuestions}/{totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground mb-3">Answered</div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(completionPercentage)}% Complete
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(timer.totalTime)}
              </div>
              <div className="text-sm text-muted-foreground mb-3">Total Time</div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Average: {totalQuestions > 0 ? formatTime(Math.round(timer.totalTime / totalQuestions)) : '0:00'} per question</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved Locally</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {storageStats?.totalAnswers || answeredQuestions}
              </div>
              <div className="text-sm text-muted-foreground mb-3">Answers Stored</div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Ready for submission</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      <div className="mb-8">
        {allQuestionsAnswered ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                All questions answered!
              </div>
              <div className="text-sm text-green-600 dark:text-green-300">
                You can now submit your answers to see your results.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="font-medium text-orange-800 dark:text-orange-200">
                {totalQuestions - answeredQuestions} questions remaining
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-300">
                You can submit now or continue answering the remaining questions.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={handleReviewAnswers}
          className="gap-2"
          disabled={pendingSubmission}
        >
          <Eye className="h-4 w-4" />
          Review Answers
        </Button>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogTrigger asChild>
            <Button
              className="gap-2"
              disabled={pendingSubmission || answeredQuestions === 0}
              size="lg"
            >
              {pendingSubmission ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Answers ({answeredQuestions})
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Your Answers?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to submit {answeredQuestions} answer{answeredQuestions !== 1 ? 's' : ''} out of {totalQuestions} total questions.
                {!allQuestionsAnswered && (
                  <span className="block mt-2 text-orange-600 dark:text-orange-400">
                    ⚠️ You have {totalQuestions - answeredQuestions} unanswered questions. These will be marked as incorrect.
                  </span>
                )}
                <span className="block mt-2 font-medium">
                  This action cannot be undone. Are you sure you want to continue?
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleSubmitAnswers();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Yes, Submit Answers
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          onClick={() => router.push('/student/dashboard')}
          className="gap-2"
          disabled={pendingSubmission}
        >
          <ArrowLeft className="h-4 w-4" />
          Save & Exit
        </Button>
      </div>

      {/* Submission Status */}
      {submissionAttempted && !pendingSubmission && (
        <div className="mt-6 text-center">
          <div className="text-sm text-muted-foreground">
            Having trouble submitting? Your answers are saved locally and you can try again later.
          </div>
        </div>
      )}
    </div>
  );
}
