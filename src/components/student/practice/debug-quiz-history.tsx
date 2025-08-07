// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentService } from '@/lib/api-services';

export function DebugQuizHistory() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing quiz history API directly...');
      
      // Test the API call directly
      const response = await StudentService.getQuizHistory({
        page: 1,
        limit: 10
      });
      
      console.log('📡 Direct API Response:', response);
      setResult(response);
    } catch (error) {
      console.error('💥 Direct API Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Debug Quiz History API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testAPI} disabled={loading}>
          {loading ? 'Testing...' : 'Test API Call'}
        </Button>
        
        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
