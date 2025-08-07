// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Play, 
  User, 
  Mail, 
  Lock,
  Database,
  TestTube
} from 'lucide-react';
import { AuthAPI } from '@/lib/auth-api';
import { StudentService } from '@/lib/api-services';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  duration?: number;
}

export function ApiTestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'TestPassword123',
    fullName: 'Test User'
  });

  // Update test result
  const updateTestResult = (name: string, updates: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, ...updates } : r);
      } else {
        return [...prev, { name, status: 'pending', ...updates }];
      }
    });
  };

  // Run individual test
  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestResult(testName, { status: 'running' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, { 
        status: 'success', 
        message: 'Test passed', 
        data: result,
        duration 
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, { 
        status: 'error', 
        message: error.message || 'Test failed',
        duration 
      });
      throw error;
    }
  };

  // Authentication Tests
  const testAuthentication = async () => {
    let authToken = null;

    // Test 1: Get Universities
    await runTest('Get Universities', async () => {
      const universities = await AuthAPI.getUniversities();
      if (!Array.isArray(universities) || universities.length === 0) {
        throw new Error('No universities returned');
      }
      return universities;
    });

    // Test 2: Get Specialties
    await runTest('Get Specialties', async () => {
      const specialties = await AuthAPI.getSpecialties();
      if (!Array.isArray(specialties) || specialties.length === 0) {
        throw new Error('No specialties returned');
      }
      return specialties;
    });

    // Test 3: User Registration
    const registrationData = {
      email: testCredentials.email,
      password: testCredentials.password,
      fullName: testCredentials.fullName,
      universityId: 1,
      specialtyId: 1,
      currentYear: 3
    };

    await runTest('User Registration', async () => {
      const result = await AuthAPI.register(registrationData);
      if (!result.userId) {
        throw new Error('Registration did not return user ID');
      }
      return result;
    });

    // Test 4: User Login
    await runTest('User Login', async () => {
      const result = await AuthAPI.login({
        email: testCredentials.email,
        password: testCredentials.password
      });
      if (!result.token) {
        throw new Error('Login did not return token');
      }
      authToken = result.token;
      return result;
    });

    // Test 5: Get Profile (requires auth)
    if (authToken) {
      await runTest('Get User Profile', async () => {
        const profile = await AuthAPI.getCurrentUser();
        if (!profile) {
          throw new Error('Could not get user profile');
        }
        return profile;
      });
    }

    return authToken;
  };

  // Student Features Tests
  const testStudentFeatures = async () => {
    // Test 1: Dashboard Performance
    await runTest('Dashboard Performance', async () => {
      const performance = await StudentService.getDashboardPerformance();
      return performance;
    });

    // Test 2: Get Notes
    await runTest('Get Notes', async () => {
      const notes = await StudentService.getNotes({ page: 1, limit: 10 });
      return notes;
    });

    // Test 3: Create Note
    await runTest('Create Note', async () => {
      const noteData = {
        noteText: 'This is a test note created by the API test suite',
        labelIds: []
      };
      const note = await StudentService.createNote(noteData);
      return note;
    });

    // Test 4: Get Labels
    await runTest('Get Labels', async () => {
      const labels = await StudentService.getLabels();
      return labels;
    });

    // Test 5: Create Label
    await runTest('Create Label', async () => {
      const labelData = {
        name: 'Test Label',
        color: '#3B82F6',
        description: 'Test label created by API test suite'
      };
      const label = await StudentService.createLabel(labelData);
      return label;
    });

    // Test 6: Get Todos
    await runTest('Get Todos', async () => {
      const todos = await StudentService.getTodos({ page: 1, limit: 10 });
      return todos;
    });

    // Test 7: Create Todo
    await runTest('Create Todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test todo created by API test suite',
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      const todo = await StudentService.createTodo(todoData);
      return todo;
    });
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      toast.info('Starting API tests...');
      
      // Run authentication tests
      await testAuthentication();
      
      // Run student features tests
      await testStudentFeatures();
      
      toast.success('All tests completed!');
    } catch (error) {
      toast.error('Some tests failed. Check results below.');
    } finally {
      setIsRunning(false);
    }
  };

  // Get test status summary
  const getTestSummary = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'success').length;
    const failed = testResults.filter(r => r.status === 'error').length;
    const running = testResults.filter(r => r.status === 'running').length;
    
    return { total, passed, failed, running };
  };

  const summary = getTestSummary();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            API Test Suite
          </CardTitle>
          <CardDescription>
            Test the Medical Education Platform API endpoints
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="config" className="space-y-4">
            <TabsList>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Test Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testCredentials.email}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="test@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Test Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="TestPassword123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={testCredentials.fullName}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Test User"
                  />
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Current API URL: {process.env.NEXT_PUBLIC_API_BASE_URL}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {/* Test Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{summary.total}</div>
                    <p className="text-xs text-muted-foreground">Total Tests</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{summary.running}</div>
                    <p className="text-xs text-muted-foreground">Running</p>
                  </CardContent>
                </Card>
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {result.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                          {result.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                          {result.status === 'pending' && <div className="h-5 w-5 rounded-full bg-gray-300" />}
                          
                          <div>
                            <h4 className="font-medium">{result.name}</h4>
                            {result.message && (
                              <p className="text-sm text-muted-foreground">{result.message}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {result.duration && (
                            <Badge variant="outline">{result.duration}ms</Badge>
                          )}
                          <Badge variant={
                            result.status === 'success' ? 'default' :
                            result.status === 'error' ? 'destructive' :
                            result.status === 'running' ? 'secondary' : 'outline'
                          }>
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {result.data && result.status === 'success' && (
                        <details className="mt-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
