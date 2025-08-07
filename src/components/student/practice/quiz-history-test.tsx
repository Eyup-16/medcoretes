// @ts-nocheck
'use client';

/**
 * Test component to validate quiz history API integration
 * This can be used for testing the new implementation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuizHistory } from '@/hooks/use-quiz-history';
import { LoadingSpinner } from '@/components/loading-states';

export function QuizHistoryTest() {
  const [testFilters, setTestFilters] = useState({});
  
  const { 
    sessions, 
    pagination, 
    loading, 
    error, 
    summary,
    filters,
    updateFilters 
  } = useQuizHistory(testFilters);

  const runTests = () => {
    console.log('🧪 Testing Quiz History API Integration');
    console.log('Sessions:', sessions);
    console.log('Pagination:', pagination);
    console.log('Summary:', summary);
    console.log('Current Filters:', filters);
    console.log('Loading:', loading);
    console.log('Error:', error);
  };

  const testFiltering = () => {
    console.log('🔍 Testing Filtering');
    updateFilters({ type: 'PRACTICE', status: 'COMPLETED' });
  };

  const testSearch = () => {
    console.log('🔎 Testing Search');
    updateFilters({ search: 'test' });
  };

  const testPagination = () => {
    console.log('📄 Testing Pagination');
    updateFilters({ page: 2 });
  };

  const resetFilters = () => {
    console.log('🔄 Resetting Filters');
    updateFilters({ 
      type: undefined, 
      status: undefined, 
      search: undefined, 
      page: 1 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Loading quiz history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History API Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={runTests} variant="outline">
            Run Tests
          </Button>
          <Button onClick={testFiltering} variant="outline">
            Test Filtering
          </Button>
          <Button onClick={testSearch} variant="outline">
            Test Search
          </Button>
          <Button onClick={testPagination} variant="outline">
            Test Pagination
          </Button>
          <Button onClick={resetFilters} variant="secondary">
            Reset Filters
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-xl font-bold">{summary.totalSessions}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">{summary.completedSessions}</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl font-bold">{summary.inProgressSessions}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-xl font-bold">{summary.averageScore}%</p>
            </div>
          </div>
        )}

        {/* Current Filters */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Current Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.type && <Badge variant="outline">Type: {filters.type}</Badge>}
            {filters.status && <Badge variant="outline">Status: {filters.status}</Badge>}
            {filters.search && <Badge variant="outline">Search: "{filters.search}"</Badge>}
            {filters.page && filters.page > 1 && <Badge variant="outline">Page: {filters.page}</Badge>}
            {!filters.type && !filters.status && !filters.search && (
              <Badge variant="secondary">No filters applied</Badge>
            )}
          </div>
        </div>

        {/* Sessions List */}
        {sessions && sessions.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium">Sessions ({sessions.length}):</p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{session.type}</Badge>
                        <Badge variant="secondary">{session.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{session.percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {session.questionsCount} questions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {sessions.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {sessions.length - 5} more sessions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages || 1} 
              {pagination.totalItems && ` (${pagination.totalItems} total items)`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
