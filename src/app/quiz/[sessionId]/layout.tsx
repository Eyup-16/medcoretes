// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QuizErrorBoundary } from '@/components/student/quiz/quiz-error-boundary';
import { useStudentAuth } from '@/hooks/use-auth';
import { FullPageLoading } from '@/components/loading-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, LogIn, Home } from 'lucide-react';
import { performSecurityCheck, logSecurityEvent } from '@/lib/session-security';

interface QuizLayoutProps {
  children: React.ReactNode;
}

/**
 * Quiz-specific layout that provides a clean, distraction-free environment
 * for quiz-taking with comprehensive authentication and authorization.
 *
 * This layout:
 * - Enforces student authentication before allowing quiz access
 * - Provides full-screen quiz experience without distractions
 * - Handles authentication errors gracefully
 * - Maintains session management and token validation
 * - Preserves theme support from root layout
 * - Includes quiz-specific error boundaries
 */
export default function QuizLayout({ children }: QuizLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  // Authentication state management
  const { isAuthenticated, user, loading: authLoading, checkAndRedirect } = useStudentAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [securityCheckPassed, setSecurityCheckPassed] = useState(false);

  // Initialize authentication check
  useEffect(() => {
    if (!authLoading && !authChecked) {
      console.log('🔐 QuizLayout: Performing authentication check for session:', sessionId);
      checkAndRedirect();
      setAuthChecked(true);
    }
  }, [authLoading, authChecked, checkAndRedirect, sessionId]);

  // Comprehensive security and session validation
  useEffect(() => {
    if (isAuthenticated && user && authChecked && !sessionValidated) {
      console.log('🔐 QuizLayout: Performing comprehensive security check for user:', user.id, 'session:', sessionId);

      const performValidation = async () => {
        try {
          const securityResult = await performSecurityCheck(sessionId, user);

          if (!securityResult.isValid) {
            console.warn('🔐 QuizLayout: Security check failed:', securityResult.reason);

            if (securityResult.shouldRedirect && securityResult.redirectPath) {
              router.push(securityResult.redirectPath);
              return;
            }
          } else {
            console.log('🔐 QuizLayout: Security check passed for session:', sessionId);
            setSecurityCheckPassed(true);
          }

          setSessionValidated(true);
        } catch (error) {
          console.error('🔐 QuizLayout: Security validation error:', error);
          logSecurityEvent('AUTH_FAILURE', {
            userId: user.id,
            sessionId,
            userRole: user.role,
            reason: 'Security validation exception'
          });
          router.push('/student/practice');
        }
      };

      performValidation();
    }
  }, [isAuthenticated, user, authChecked, sessionValidated, sessionId, router]);

  // Show loading state while authentication is being checked
  if (authLoading || !authChecked) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <FullPageLoading message="Authenticating..." />
      </div>
    );
  }

  // Show authentication required screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in as a student to access quiz sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Please log in to continue with your quiz session.
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role validation error if user is not a student
  if (user && user.role !== 'STUDENT') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              Quiz sessions are only available to students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Your account role ({user.role}) does not have access to quiz sessions.
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  // Redirect to appropriate dashboard based on user role
                  const dashboardPath = user.role === 'ADMIN' ? '/admin/content/' :
                                       user.role === 'EMPLOYEE' ? '/employee/dashboard' : '/';
                  router.push(dashboardPath);
                }}
                className="w-full"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while session is being validated
  if (!sessionValidated || !securityCheckPassed) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <FullPageLoading message={!sessionValidated ? "Validating session access..." : "Performing security checks..."} />
      </div>
    );
  }

  // Render the authenticated quiz layout
  return (
    <QuizErrorBoundary>
      <TooltipProvider>
        <div className="h-screen w-full bg-background overflow-hidden">
          {children}
        </div>
      </TooltipProvider>
    </QuizErrorBoundary>
  );
}
