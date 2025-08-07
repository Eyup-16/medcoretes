// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useStudentAuth } from '@/hooks/use-auth';
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
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import components (to be created)
import { GlobalAnalyticsOverview } from '@/components/student/analytics/global-analytics-overview';
import { SessionAnalyticsList } from '@/components/student/analytics/session-analytics-list';

export default function AnalyticsPage() {
  const { isAuthenticated, user, loading: authLoading, checkAndRedirect } = useStudentAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication and redirect if needed
  useEffect(() => {
    checkAndRedirect();
  }, [checkAndRedirect, isAuthenticated, user, authLoading]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Analytics data refreshed');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
            
            {/* Overview Cards Skeleton */}
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
            
            {/* Session List Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">


        {/* Global Analytics Overview */}
        <GlobalAnalyticsOverview key={`overview-${refreshKey}`} />

        {/* Session Analytics List */}
        <SessionAnalyticsList key={`sessions-${refreshKey}`} />
      </div>
    </div>
  );
}
