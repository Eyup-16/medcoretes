// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Crown,
  Gift
} from 'lucide-react';
import { AuthService } from '@/lib/api-services';
import { useStudentAuth } from '@/hooks/use-auth';
import { DataLoadingState } from '@/components/loading-states';
import { toast } from 'sonner';

// Updated interface to match actual API structure
interface Subscription {
  id: number;
  userId?: number;
  studyPackId?: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  daysRemaining: number;
  studyPack: {
    id: number;
    name: string;
    description: string;
    type: 'YEAR' | 'RESIDENCY';
    yearNumber: string;
    price: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    statistics?: {
      totalCourses: number;
      totalModules: number;
      totalUnites: number;
    };
  };
}

export default function SubscriptionsPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions using the working /students/subscriptions endpoint
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the StudentService to get subscriptions
      const response = await StudentService.getSubscriptions();

      if (response.success && response.data) {
        // Extract subscriptions from the nested response structure
        // API returns: { success: true, data: { success: true, data: [...] } }
        const subscriptionsData = response.data.data?.data || response.data.data || response.data || [];

        if (Array.isArray(subscriptionsData) && subscriptionsData.length > 0) {
          setSubscriptions(subscriptionsData);
        } else {
          // Set empty array instead of error for no subscriptions
          setSubscriptions([]);
        }
      } else {
        setError(response.error || 'Failed to load subscription data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadSubscriptions();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return <DataLoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Subscriptions</h1>
            <p className="text-muted-foreground leading-relaxed">
              Manage your active subscriptions and access to study materials
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadSubscriptions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Gift className="h-4 w-4 mr-2" />
              Browse Plans
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <DataLoadingState />
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Subscriptions</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadSubscriptions}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <EmptySubscriptionsState />
        ) : (
          <SubscriptionsDisplay subscriptions={subscriptions} />
        )}
      </div>
    </div>
  );
}

// Empty state component
function EmptySubscriptionsState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No Active Subscriptions</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            You don't have any active subscriptions yet. Browse our study packs to get started with your medical education journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Study Packs
            </Button>
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to display subscriptions
function SubscriptionsDisplay({ subscriptions }: { subscriptions: Subscription[] }) {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE');
  const inactiveSubscriptions = subscriptions.filter(sub => sub.status !== 'ACTIVE');

  return (
    <div className="space-y-8">
      
      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-chart-2" />
            <h2 className="text-2xl font-semibold">Active Subscriptions</h2>
            <Badge variant="default">{activeSubscriptions.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeSubscriptions.map((subscription, index) => (
              <div key={subscription.id} className={`animate-fade-in-up ${index === 0 ? 'animate-delay-100' : index === 1 ? 'animate-delay-200' : 'animate-delay-300'}`}>
                <SubscriptionCard subscription={subscription} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Past Subscriptions</h2>
            <Badge variant="secondary">{inactiveSubscriptions.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inactiveSubscriptions.map((subscription, index) => (
              <div key={subscription.id} className="animate-fade-in-up animate-delay-300">
                <SubscriptionCard subscription={subscription} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual subscription card
function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const isActive = subscription.status === 'ACTIVE' && subscription.isActive;

  // Use API-provided values instead of calculating
  const daysRemaining = subscription.daysRemaining || 0;

  // Calculate progress percentage based on days remaining
  const totalDays = Math.ceil((new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = isActive ? Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100) : 100;

  const getStatusVariant = (status: string, isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    if (!isActive) return 'secondary';
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'EXPIRED': return 'destructive';
      case 'CANCELLED': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'YEAR': return 'default';
      case 'RESIDENCY': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={`${isActive ? 'border-chart-2/30 bg-chart-2/5 card-hover-lift' : 'border-border bg-muted/20'} transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {isActive && <Crown className="h-5 w-5 text-chart-3" />}
              {subscription.studyPack.name}
            </CardTitle>
            <CardDescription>
              {subscription.studyPack.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(subscription.status, isActive)}>
              {subscription.status}
            </Badge>
            <Badge variant={getTypeVariant(subscription.studyPack.type)}>
              {subscription.studyPack.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Progress Bar (for active subscriptions) */}
        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subscription Progress</span>
              <span className="font-medium">{daysRemaining} days remaining</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Study Pack Info */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Study Pack Details</span>
            <Badge variant="outline">
              {subscription.studyPack.yearNumber} Year
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subscription.studyPack.description}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pack Price</span>
            <span className="font-medium">${subscription.studyPack.price}</span>
          </div>
        </div>

        <Separator />

        {/* Subscription Details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium">
              {new Date(subscription.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">End Date</span>
            <span className="font-medium">
              {new Date(subscription.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium text-chart-2">
              ${subscription.amountPaid}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              {subscription.paymentMethod}
            </span>
          </div>
          {subscription.paymentReference && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Reference</span>
              <span className="font-medium text-xs font-mono text-muted-foreground">
                {subscription.paymentReference}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isActive ? (
            <>
              <Button className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Access Content
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
