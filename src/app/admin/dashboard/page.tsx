// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Dashboard Redirect Page
 * 
 * This page redirects admin users from the old /admin/dashboard route
 * to the new /admin/content/ route where the main admin functionality
 * is located.
 */
export default function AdminDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the admin content page
    router.replace('/admin/content/');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to admin content...</p>
      </div>
    </div>
  );
}
