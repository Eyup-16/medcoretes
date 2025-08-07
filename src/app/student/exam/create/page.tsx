'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExamCreationForm } from '@/components/student/exam-creation/exam-creation-form';
import { useAuth } from '@/hooks/use-auth';

export default function CreateExamPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Handle successful exam creation
  const handleExamCreated = (examSession: any) => {
    console.log('handleExamCreated called with:', examSession);

    toast.success('Exam session created successfully!');

    // Navigate to the exam session
    if (examSession?.sessionId) {
      console.log(`Navigating to exam session: ${examSession.sessionId}`);
      router.push(`/quiz/${examSession.sessionId}`);
    } else {
      console.warn('No sessionId found in exam session data, redirecting to practice page');
      console.log('Exam session data:', examSession);
      // Fallback to practice page
      router.push('/student/practice');
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    router.push('/student/practice');
  };

  // Get user profile data
  const userProfile = {
    yearLevel: user?.currentYear || 'ONE', // Default to first year if not available
    subscription: user?.subscription
  };

  return (
    <div className="min-h-screen bg-background exam-theme">
      <div className="container mx-auto py-8">
        <ExamCreationForm
          onExamCreated={handleExamCreated}
          onCancel={handleCancel}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
}
