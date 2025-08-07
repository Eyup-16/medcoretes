// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useQuizSessions } from '@/hooks/use-quiz-api';
import { useSessionResults } from '@/hooks/use-session-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen,
  Users,
  Zap,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import sub-components
import { PerformanceSummaryCards } from './performance-summary-cards';

interface GlobalAnalyticsOverviewProps {
  className?: string;
}

export function GlobalAnalyticsOverview({ className }: GlobalAnalyticsOverviewProps) {
  const {
    sessions: completedSessions,
    loading: sessionsLoading,
    error: sessionsError
  } = useQuizSessions({
    status: 'COMPLETED',
    limit: 50, // Get more sessions for better analytics
    // Add cache busting to ensure fresh data
    _t: Date.now()
  });

  const {
    data: sessionResults,
    loading: resultsLoading,
    error: resultsError
  } = useSessionResults({
    page: 1,
    limit: 50
  });

  const [analyticsData, setAnalyticsData] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    improvementTrend: 0,
    weeklyGoalProgress: 0,
    strongestSubject: '',
    weakestSubject: '',
    currentStreak: 0
  });

  // Process analytics data
  useEffect(() => {
    if (completedSessions && sessionResults) {
      const allSessions = Array.isArray(completedSessions) ? completedSessions : [];

      // Debug: Log session data in GlobalAnalyticsOverview (uncomment for debugging)
      // if (allSessions.length > 0) {
      //   console.log('🔍 GlobalAnalytics Debug - Raw sessions:', allSessions.slice(0, 3));
      // }

      // Ensure we only process completed sessions - filter client-side as backup
      const sessions = allSessions.filter(session => {
        // Be very strict about what constitutes a completed session
        const hasCompletedStatus = session.status === 'COMPLETED' || session.status === 'completed';
        const hasValidScore = session.score !== undefined && session.score !== null && session.score >= 0;
        const hasValidPercentage = session.percentage !== undefined && session.percentage !== null && session.percentage >= 0;
        const hasCompletedAt = session.completedAt !== undefined && session.completedAt !== null;

        // A session is considered completed if:
        // 1. It has a COMPLETED status, AND
        // 2. It has either a valid score OR percentage, AND
        // 3. It has a completion timestamp
        return hasCompletedStatus && (hasValidScore || hasValidPercentage) && hasCompletedAt;
      });

      // Debug: Log filtered results (uncomment for debugging)
      // console.log('🔍 GlobalAnalytics Debug - Filtered sessions:', sessions.length, 'out of', allSessions.length);

      const results = Array.isArray(sessionResults) ? sessionResults : [];
      
      // Calculate basic metrics
      const totalSessions = sessions.length;
      const totalScore = sessions.reduce((sum, session) => sum + (session.percentage || 0), 0);
      const averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
      
      // Calculate total time spent from real session data
      const totalTimeSpent = sessions.reduce((sum, session) => {
        const sessionTime = session.duration ? Math.round(session.duration / 60) : // Convert seconds to minutes
                           session.timeSpent ? Math.round(session.timeSpent / 60) : // Convert seconds to minutes
                           0; // No time data available
        return sum + sessionTime;
      }, 0);
      
      // Calculate improvement trend (compare recent vs older sessions)
      let improvementTrend = 0;
      if (sessions.length >= 4) {
        const recentSessions = sessions.slice(-2);
        const olderSessions = sessions.slice(0, 2);
        
        const recentAvg = recentSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / olderSessions.length;
        
        improvementTrend = recentAvg - olderAvg;
      }
      
      // Calculate weekly goal progress from real data
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sessionsThisWeek = sessions.filter(session => {
        const sessionDate = new Date(session.completedAt || session.createdAt);
        return sessionDate >= weekAgo;
      }).length;
      const weeklyGoalProgress = Math.min((sessionsThisWeek / 5) * 100, 100); // Assume goal of 5 sessions per week

      // Get subjects from real data if available
      const strongestSubject = sessions[0]?.strongestSubject || null;
      const weakestSubject = sessions[0]?.weakestSubject || null;

      // Calculate current streak from real data
      const currentStreak = sessions[0]?.currentStreak || 0;
      
      setAnalyticsData({
        totalSessions,
        averageScore: Math.round(averageScore),
        totalTimeSpent,
        improvementTrend: Math.round(improvementTrend * 10) / 10,
        weeklyGoalProgress: Math.round(weeklyGoalProgress),
        strongestSubject,
        weakestSubject,
        currentStreak
      });
    }
  }, [completedSessions, sessionResults]);

  const isLoading = sessionsLoading || resultsLoading;
  const hasError = sessionsError || resultsError;

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Performance Overview
          </h2>
          <p className="text-muted-foreground">
            Your learning progress and key performance indicators
          </p>
        </div>

        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Analytics</h3>
            <p className="text-muted-foreground mb-4">
              {sessionsError || resultsError || 'There was an error loading your performance data.'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="btn-modern"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Performance Overview
        </h2>
        <p className="text-muted-foreground">
          Your learning progress and key performance indicators
        </p>
      </div>

      {/* Performance Summary Cards */}
      <PerformanceSummaryCards data={analyticsData} />
      

    </div>
  );
}
