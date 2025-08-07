// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  CheckCircle,
  Plus,
  Target,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useStudentAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/loading-states';
import { useQuizSessions } from '@/hooks/use-quiz-api';

// Import components (to be created)
import { EnhancedSessionHistorySection } from '@/components/student/practice/enhanced-session-history';
import { QuizTypeSelectionModal } from '@/components/student/quiz-type-selection-modal';

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useStudentAuth();

  const [showQuizTypeModal, setShowQuizTypeModal] = useState(false);

  // Fetch quiz sessions for statistics
  const { sessions: completedSessions, loading: sessionsLoading } = useQuizSessions({ status: 'COMPLETED' });

  // Calculate statistics from real data
  // Ensure sessions are arrays before using array methods
  const completedSessionsArray = Array.isArray(completedSessions) ? completedSessions : [];

  const stats = {
    completedSessions: completedSessionsArray.length,
    averageScore: completedSessionsArray.length > 0
      ? Math.round(completedSessionsArray.reduce((sum, session) => sum + (session.percentage || 0), 0) / completedSessionsArray.length)
      : 0
  };

  if (loading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // useStudentAuth will handle redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted dark:from-background dark:via-muted/10 dark:to-card">
      <div className="container mx-auto px-[calc(var(--spacing)*4)] sm:px-[calc(var(--spacing)*6)] md:px-[calc(var(--spacing)*8)] py-[calc(var(--spacing)*6)] sm:py-[calc(var(--spacing)*8)] max-w-7xl">

        {/* Enhanced Header Section with Improved Visual Hierarchy */}
        <header className="mb-[calc(var(--spacing)*12)] sm:mb-[calc(var(--spacing)*16)]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-[calc(var(--spacing)*8)] lg:gap-[calc(var(--spacing)*12)]">
            <div className="flex-1 space-y-[calc(var(--spacing)*6)]">
              {/* Primary Content Block */}
              <div className="flex items-start gap-[calc(var(--spacing)*5)]">
                <div className="relative flex-shrink-0">
                  <div className="p-[calc(var(--spacing)*4)] bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl animate-pulse-soft shadow-xl border border-primary/10">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-chart-2 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="space-y-[calc(var(--spacing)*4)] flex-1">
                  {/* Title Hierarchy */}
                  <div className="space-y-[calc(var(--spacing)*3)]">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none animate-slide-up">
                      <span className="bg-gradient-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent">
                        Practice Center
                      </span>
                    </h1>
                    <div className="flex items-center gap-[calc(var(--spacing)*3)]">
                      <div className="h-1.5 w-16 bg-gradient-to-r from-primary to-chart-1 rounded-full shadow-sm"></div>
                      <div className="h-1.5 w-12 bg-gradient-to-r from-chart-1 to-chart-2 rounded-full shadow-sm"></div>
                      <div className="h-1.5 w-6 bg-gradient-to-r from-chart-2 to-chart-3 rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  {/* Secondary Content */}
                  <div className="space-y-[calc(var(--spacing)*4)]">
                    <p className="text-xl sm:text-2xl text-muted-foreground text-pretty leading-relaxed max-w-3xl font-light">
                      Create custom quizzes and track your practice progress with our comprehensive learning platform
                    </p>

                    {/* Feature Highlights */}
                    <div className="flex flex-wrap items-center gap-[calc(var(--spacing)*6)] text-base text-muted-foreground">
                      <div className="flex items-center gap-[calc(var(--spacing)*3)]">
                        <div className="w-3 h-3 bg-gradient-to-r from-chart-2 to-chart-4 rounded-full animate-pulse shadow-sm"></div>
                        <span className="font-semibold">Personalized Learning</span>
                      </div>
                      <div className="flex items-center gap-[calc(var(--spacing)*3)]">
                        <div className="w-3 h-3 bg-gradient-to-r from-chart-3 to-chart-5 rounded-full animate-pulse shadow-sm"></div>
                        <span className="font-semibold">Progress Tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Primary CTA Area */}
            <div className="flex flex-col items-center lg:items-end gap-[calc(var(--spacing)*4)] lg:flex-shrink-0">
              {/* CTA Container with Enhanced Visual Hierarchy */}
              <div className="relative group">
                {/* Animated Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-chart-1/20 to-primary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 animate-pulse-glow transition-all duration-500"></div>

                {/* Main CTA Button */}
                <Button
                  onClick={() => setShowQuizTypeModal(true)}
                  size="lg"
                  className="group/btn relative overflow-hidden bg-gradient-to-r from-primary via-chart-1 to-primary hover:from-primary/90 hover:via-chart-1/90 hover:to-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out border-0 rounded-2xl px-8 py-4 text-lg font-bold tracking-wide min-w-[200px] focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                  aria-label="Create a new quiz to start practicing"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></div>

                  {/* Pulse Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                  {/* Icon with Enhanced Animation */}
                  <Plus className="h-6 w-6 mr-3 transition-all duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110 group-active/btn:scale-125" />

                  {/* Button Text */}
                  <span className="relative z-10 font-bold tracking-wide">Create New Quiz</span>

                  {/* Outer Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 to-chart-1/40 rounded-2xl blur-lg opacity-0 group-hover/btn:opacity-50 transition-all duration-300 -z-10"></div>
                </Button>
              </div>

              {/* Supporting CTA Text */}
              <div className="text-center lg:text-right space-y-[calc(var(--spacing)*1)]">
                <p className="text-sm font-medium text-muted-foreground">
                  Ready to start learning?
                </p>
                <div className="flex items-center justify-center lg:justify-end gap-[calc(var(--spacing)*2)] text-xs text-muted-foreground">
                  <div className="flex items-center gap-[calc(var(--spacing)*1)]">
                    <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
                    <span>Quick Setup</span>
                  </div>
                  <div className="flex items-center gap-[calc(var(--spacing)*1)]">
                    <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse"></div>
                    <span>Instant Start</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Decorative Separator */}
          <div className="mt-[calc(var(--spacing)*8)] flex items-center gap-[calc(var(--spacing)*6)]">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1"></div>
            <div className="p-[calc(var(--spacing)*3)] bg-gradient-to-br from-muted/50 to-muted/30 rounded-full shadow-sm border border-border/50">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1"></div>
          </div>
        </header>

        {/* Main Content Section */}
        <div className="space-y-[calc(var(--spacing)*8)]">
          <div className="animate-fade-in-up">
            <EnhancedSessionHistorySection
              defaultFilters={{
                status: 'COMPLETED',
                type: undefined // Will show both PRACTICE and EXAM types
              }}
              hideActionButtons={true}
              allowedTypes={['PRACTICE', 'EXAM']}
            />
          </div>
        </div>
      </div>

      {/* Quiz Type Selection Modal */}
      <QuizTypeSelectionModal
        isOpen={showQuizTypeModal}
        onClose={() => setShowQuizTypeModal(false)}
      />
    </div>
  );
}
