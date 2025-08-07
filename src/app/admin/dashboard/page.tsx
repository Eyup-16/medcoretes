'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { StatsCards, DetailedStatsCards } from '@/components/admin/dashboard/stats-cards';

/**
 * Admin Dashboard Overview Page
 *
 * Main dashboard page showing key metrics, analytics, and system overview
 * for admin users. Uses real API data with no mock data.
 */
export default function AdminDashboardPage() {
  const {
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
    hasData,
    hasError,
    isRefreshing
  } = useAdminDashboard();

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform&apos;s performance and key metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to load dashboard data: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Cards */}
      <StatsCards stats={stats} loading={loading} error={error} />

      {/* Detailed Stats Cards */}
      {hasData && <DetailedStatsCards stats={stats} loading={loading} error={error} />}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage users, subscriptions, and access controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="justify-start w-full">
                View All Users
              </Button>
              <Button variant="outline" size="sm" className="justify-start w-full">
                Manage Subscriptions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <BookOpen className="w-4 h-4 mr-2" />
              Content Management
            </CardTitle>
            <CardDescription>
              Manage quizzes, exams, and educational content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="justify-start w-full">
                Import Questions
              </Button>
              <Button variant="outline" size="sm" className="justify-start w-full">
                Manage Exams
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed analytics and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="justify-start w-full">
                User Analytics
              </Button>
              <Button variant="outline" size="sm" className="justify-start w-full">
                Performance Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Calendar className="w-4 h-4 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default">System Online</Badge>
              <Badge variant="secondary">API Connected</Badge>
              {hasData && <Badge variant="outline">Data Current</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              All systems operational
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
