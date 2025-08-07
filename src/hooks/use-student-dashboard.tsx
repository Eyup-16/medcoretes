// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentService } from '@/lib/api-services';
import { StudentDashboardPerformance, UserSubscription, ProgressOverview } from '@/types/api';
import { toast } from 'sonner';

// Interface for dashboard state
interface DashboardState {
  performance: StudentDashboardPerformance | null;
  subscriptions: UserSubscription[] | null;
  progressOverview: ProgressOverview | null;
  loading: boolean;
  error: string | null;
}

// Hook for managing student dashboard data
export function useStudentDashboard() {
  const [state, setState] = useState<DashboardState>({
    performance: null,
    subscriptions: null,
    progressOverview: null,
    loading: true,
    error: null,
  });

  // Fetch dashboard performance data
  const fetchPerformance = useCallback(async () => {
    try {
      const response = await StudentService.getDashboardPerformance();

      if (response.success) {
        // Extract the actual performance data from the nested response structure
        // API returns: { success: true, data: { success: true, data: { success: true, data: {...} } } }
        const performanceData = response.data?.data?.data || response.data?.data || response.data || null;

        setState(prev => ({
          ...prev,
          performance: performanceData,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch performance data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance data';
      setState(prev => ({
        ...prev,
        performance: null,
        error: errorMessage,
      }));
      console.error('Dashboard performance fetch error:', error);

      // Don't show toast for network errors to avoid spam
      if (!errorMessage.includes('fetch') && !errorMessage.includes('network')) {
        toast.error('Failed to load performance data');
      }
    }
  }, []);

  // Fetch subscriptions data
  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await StudentService.getSubscriptions();

      if (response.success) {
        // Extract the actual subscriptions array from the nested response structure
        // API returns: { success: true, data: { success: true, data: [...] } }
        const subscriptionsData = response.data?.data?.data || response.data?.data || response.data || [];

        setState(prev => ({
          ...prev,
          subscriptions: Array.isArray(subscriptionsData) ? subscriptionsData : [],
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
      setState(prev => ({
        ...prev,
        subscriptions: null,
        error: errorMessage,
      }));
      console.error('Subscriptions fetch error:', error);

      // Don't show toast for network errors to avoid spam
      if (!errorMessage.includes('fetch') && !errorMessage.includes('network')) {
        toast.error('Failed to load subscription data');
      }
    }
  }, []);

  // Fetch progress overview
  const fetchProgressOverview = useCallback(async () => {
    try {
      const response = await StudentService.getProgressOverview();

      if (response.success) {
        // Extract the actual progress data from the nested response structure
        // API returns: { success: true, data: { success: true, data: { success: true, data: {...} } } }
        const progressData = response.data?.data?.data || response.data?.data || response.data || null;

        setState(prev => ({
          ...prev,
          progressOverview: progressData,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch progress overview');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch progress overview';
      setState(prev => ({
        ...prev,
        progressOverview: null,
        error: errorMessage,
      }));
      console.error('Progress overview fetch error:', error);

      // Don't show toast for network errors or 403 errors to avoid spam
      if (typeof errorMessage === 'string' &&
          !errorMessage.includes('fetch') &&
          !errorMessage.includes('network') &&
          !errorMessage.includes('403')) {
        toast.error('Failed to load progress overview');
      }
    }
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchPerformance(),
        fetchSubscriptions(),
        fetchProgressOverview(),
      ]);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchPerformance, fetchSubscriptions, fetchProgressOverview]);

  // Update course progress
  const updateCourseProgress = useCallback(async (
    courseId: number,
    progressData: {
      progress: number;
      timeSpent?: number;
      completed?: boolean;
    }
  ) => {
    try {
      const response = await StudentService.updateCourseProgress(courseId, progressData);
      
      if (response.success) {
        toast.success('Progress updated successfully');
        // Refresh dashboard data to reflect changes
        await fetchDashboardData();
      } else {
        throw new Error(response.error || 'Failed to update progress');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchDashboardData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  // Initialize data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...state,
    updateCourseProgress,
    clearError,
    refresh,
  };
}

// Hook for quiz history with pagination
export function useQuizHistory(params: {
  type?: 'PRACTICE' | 'EXAM';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
} = {}) {
  const [state, setState] = useState<{
    data: any[] | null;
    pagination: any | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    pagination: null,
    loading: true,
    error: null,
  });

  const fetchQuizHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await StudentService.getQuizHistory(params);
      
      if (response.success) {
        setState({
          data: response.data.data,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch quiz history');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz history';
      setState({
        data: null,
        pagination: null,
        loading: false,
        error: errorMessage,
      });
      console.error('Quiz history fetch error:', error);
    }
  }, [params.page, params.limit, params.search, params.subjectId, params.sessionType, params.startDate, params.endDate, params.sortBy, params.sortOrder]);

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  return {
    ...state,
    refresh: fetchQuizHistory,
  };
}

// Hook for session results with filtering
export function useSessionResults(filters: {
  answerType?: 'correct' | 'incorrect' | 'all';
  sessionType?: 'PRACTICE' | 'EXAM' | 'REVIEW';
  dateFrom?: string;
  dateTo?: string;
  sessionId?: number;
  page?: number;
  limit?: number;
} = {}) {
  const [state, setState] = useState<{
    data: any[] | null;
    pagination: any | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    pagination: null,
    loading: true,
    error: null,
  });

  const fetchSessionResults = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await StudentService.getSessionResults(filters);
      
      if (response.success) {
        setState({
          data: response.data.data,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch session results');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch session results';
      setState({
        data: null,
        pagination: null,
        loading: false,
        error: errorMessage,
      });
      console.error('Session results fetch error:', error);
    }
  }, [filters.page, filters.limit, filters.search, filters.subjectId, filters.sessionType, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchSessionResults();
  }, [fetchSessionResults]);

  return {
    ...state,
    refresh: fetchSessionResults,
  };
}
