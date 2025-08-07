// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  StickyNote,
  CheckSquare,
  Tag,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Target,
  BarChart3,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  HelpCircle,
  Bug,
  Palette,
  Hash,
  MessageSquare,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  useNotes, 
  useTodos, 
  useLabels, 
  Note, 
  Todo, 
  Label as LabelType 
} from '@/hooks/use-student-organization';
import { useQuestionReports, useReportStatistics, QuestionReport } from '@/hooks/use-question-reports';
import { useStudentAuth } from '@/hooks/use-auth';
import { DataLoadingState, DashboardLoadingSkeleton } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';



// Report type configurations
const reportTypeConfig = {
  'INCORRECT_ANSWER': {
    label: 'Incorrect Answer',
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive'
  },
  'UNCLEAR_QUESTION': {
    label: 'Unclear Question',
    icon: HelpCircle,
    color: 'bg-chart-3/10 text-chart-3'
  },
  'TECHNICAL_ERROR': {
    label: 'Technical Error',
    icon: Bug,
    color: 'bg-primary/10 text-primary'
  },
  'CONTENT_ERROR': {
    label: 'Content Error',
    icon: FileText,
    color: 'bg-chart-5/10 text-chart-5'
  },
  'OTHER': {
    label: 'Other',
    icon: MoreHorizontal,
    color: 'bg-muted text-muted-foreground'
  }
};

// Status configurations
const statusConfig = {
  'PENDING': {
    label: 'Pending',
    icon: Clock,
    color: 'bg-chart-1/10 text-chart-1'
  },
  'REVIEWED': {
    label: 'Reviewed',
    icon: Eye,
    color: 'bg-chart-3/10 text-chart-3'
  },
  'RESOLVED': {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'bg-chart-2/10 text-chart-2'
  },
  'REJECTED': {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive'
  }
};

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useStudentAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Notes state and filters
  const [notesFilters, setNotesFilters] = useState({
    search: '',
    labelIds: [] as number[],
    page: 1,
    limit: 12,
  });
  const [notesGroupBy, setNotesGroupBy] = useState<'question' | 'date' | 'none'>('question');
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [noteForm, setNoteForm] = useState({
    noteText: '',
    questionId: undefined as number | undefined,
    labelIds: [] as number[],
  });

  // Todos state and filters
  const [todosFilters, setTodosFilters] = useState({
    status: 'all' as 'pending' | 'completed' | 'all',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high',
    search: '',
    page: 1,
    limit: 20,
  });
  const [showCreateTodoDialog, setShowCreateTodoDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Labels state
  const [labelsSearchTerm, setLabelsSearchTerm] = useState('');
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelType | null>(null);
  const [labelForm, setLabelForm] = useState({
    name: '',
  });

  // Reports state and filters
  const [reportsFilters, setReportsFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED',
    reportType: 'all',
    page: 1,
    limit: 12,
  });
  const [showCreateReportDialog, setShowCreateReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [reportForm, setReportForm] = useState({
    questionId: '',
    reportType: '',
    description: '',
  });

  // API hooks
  const { notes, pagination: notesPagination, loading: notesLoading, error: notesError, refresh: refreshNotes, createNote, updateNote, deleteNote } = useNotes(notesFilters);

  const apiTodosFilters = useMemo(() => ({
    ...todosFilters,
    priority: todosFilters.priority === 'all' ? undefined : todosFilters.priority,
  }), [todosFilters]);
  const { todos, pagination: todosPagination, loading: todosLoading, error: todosError, refresh: refreshTodos, createTodo, updateTodo, completeTodo, deleteTodo } = useTodos(apiTodosFilters);

  const { labels, loading: labelsLoading, error: labelsError, refresh: refreshLabels, createLabel, updateLabel, deleteLabel } = useLabels();

  const { reports, pagination: reportsPagination, loading: reportsLoading, error: reportsError, refresh: refreshReports, createReport } = useQuestionReports(reportsFilters);
  const { stats: reportStats, loading: reportStatsLoading } = useReportStatistics();

  // Group notes by question - moved before early returns to fix hooks order
  const groupedNotes = useMemo(() => {
    if (!notes || notesGroupBy === 'none') {
      return { ungrouped: notes || [] };
    }

    if (notesGroupBy === 'question') {
      const grouped: { [key: string]: Note[] } = {};

      notes.forEach(note => {
        if (note.questionId && note.question) {
          const key = `question-${note.questionId}`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(note);
        } else {
          // Notes without questions go to "General Notes"
          if (!grouped['general']) {
            grouped['general'] = [];
          }
          grouped['general'].push(note);
        }
      });

      return grouped;
    }

    if (notesGroupBy === 'date') {
      const grouped: { [key: string]: Note[] } = {};

      notes.forEach(note => {
        const date = new Date(note.createdAt).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(note);
      });

      return grouped;
    }

    return { ungrouped: notes };
  }, [notes, notesGroupBy]);

  if (authLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null; // useStudentAuth will handle redirect
  }

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLabelById = (labelId: number) => {
    return labels?.find(label => label.id === labelId);
  };



  const getReportTypeConfig = (type: string) => {
    return reportTypeConfig[type as keyof typeof reportTypeConfig] || reportTypeConfig.OTHER;
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'MEDIUM':
        return 'text-chart-3 bg-chart-3/10 border-chart-3/20';
      case 'LOW':
        return 'text-chart-2 bg-chart-2/10 border-chart-2/20';
      default:
        return 'text-muted-foreground bg-muted border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityIcon = (priority: Todo['priority']) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return AlertTriangle;
      case 'MEDIUM':
        return Flag;
      case 'LOW':
        return Target;
      default:
        return Flag;
    }
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.dueDate || todo.status === 'COMPLETED') return false;
    return new Date(todo.dueDate) < new Date();
  };

  // Notes handlers
  const updateNotesFilters = (newFilters: Partial<typeof notesFilters>) => {
    setNotesFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleNotesSearch = (search: string) => {
    updateNotesFilters({ search });
  };

  const handleCreateNote = async () => {
    if (!noteForm.noteText.trim()) {
      return;
    }

    try {
      await createNote({
        noteText: noteForm.noteText,
        questionId: noteForm.questionId,
        labelIds: noteForm.labelIds
      });
      setNoteForm({ noteText: '', questionId: undefined, labelIds: [] });
      setShowCreateNoteDialog(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !noteForm.noteText.trim()) {
      return;
    }

    try {
      await updateNote(editingNote.id, {
        noteText: noteForm.noteText,
        labelIds: noteForm.labelIds
      });
      setNoteForm({ noteText: '', questionId: undefined, labelIds: [] });
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const openEditNoteDialog = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      noteText: note.noteText || '',
      questionId: note.questionId,
      labelIds: [],
    });
  };

  const toggleQuestionExpansion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };



  const getQuestionInfo = (groupKey: string, groupNotes: Note[]) => {
    if (groupKey === 'general') {
      return { id: 0, questionText: 'General Notes', isGeneral: true };
    }

    if (groupKey.startsWith('question-')) {
      const firstNote = groupNotes[0];
      return {
        id: firstNote.questionId!,
        questionText: firstNote.question?.questionText || 'Unknown Question',
        isGeneral: false
      };
    }

    return { id: 0, questionText: groupKey, isGeneral: false };
  };

  // Todos handlers
  const updateTodosFilters = (newFilters: Partial<typeof todosFilters>) => {
    setTodosFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleCreateTodo = async () => {
    if (!todoForm.title.trim()) {
      return;
    }

    try {
      await createTodo({
        ...todoForm,
        priority: todoForm.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: todoForm.dueDate.trim() ? `${todoForm.dueDate}T23:59:59.000Z` : undefined,
      });
      setTodoForm({ title: '', description: '', dueDate: '', priority: 'medium' });
      setShowCreateTodoDialog(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleEditTodo = async () => {
    if (!editingTodo || !todoForm.title.trim()) {
      return;
    }

    try {
      await updateTodo(editingTodo.id, {
        ...todoForm,
        priority: todoForm.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: todoForm.dueDate.trim() ? `${todoForm.dueDate}T23:59:59.000Z` : undefined,
      });
      setTodoForm({ title: '', description: '', dueDate: '', priority: 'medium' });
      setEditingTodo(null);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      if (todo.status === 'COMPLETED') {
        await updateTodo(todo.id, { status: 'PENDING' });
      } else {
        await completeTodo(todo.id);
      }
    } catch (error) {
      console.error('Failed to toggle todo completion:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todoId);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const openEditTodoDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      priority: todo.priority.toLowerCase() as 'low' | 'medium' | 'high',
    });
  };

  const getTodosStats = () => {
    if (!todos) return { total: 0, completed: 0, pending: 0, overdue: 0 };

    const total = todos.length;
    const completed = todos.filter(t => t.status === 'COMPLETED').length;
    const pending = todos.filter(t => t.status !== 'COMPLETED').length;
    const overdue = todos.filter(t => isOverdue(t)).length;

    return { total, completed, pending, overdue };
  };

  // Labels handlers
  const filteredLabels = labels?.filter(label =>
    label.name.toLowerCase().includes(labelsSearchTerm.toLowerCase())
  ) || [];

  const handleCreateLabel = async () => {
    if (!labelForm.name.trim()) {
      return;
    }

    try {
      await createLabel(labelForm);
      setLabelForm({ name: '' });
      setShowCreateLabelDialog(false);
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleEditLabel = async () => {
    if (!editingLabel || !labelForm.name.trim()) {
      return;
    }

    try {
      await updateLabel(editingLabel.id, labelForm);
      setLabelForm({ name: '' });
      setEditingLabel(null);
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: number) => {
    if (confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      try {
        await deleteLabel(labelId);
      } catch (error) {
        console.error('Failed to delete label:', error);
      }
    }
  };

  const openEditLabelDialog = (label: LabelType) => {
    setEditingLabel(label);
    setLabelForm({
      name: label.name,
    });
  };

  // Reports handlers
  const updateReportsFilters = (newFilters: Partial<typeof reportsFilters>) => {
    setReportsFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleReportsSearch = (search: string) => {
    updateReportsFilters({ search });
  };

  const handleCreateReport = async () => {
    if (!reportForm.questionId.trim() || !reportForm.reportType || !reportForm.description.trim()) {
      return;
    }

    try {
      await createReport(parseInt(reportForm.questionId), {
        reportType: reportForm.reportType,
        description: reportForm.description.trim()
      });
      setReportForm({ questionId: '', reportType: '', description: '' });
      setShowCreateReportDialog(false);
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted dark:from-background dark:via-muted/10 dark:to-card">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
                <p className="text-muted-foreground">
                  Organize your study materials, tasks, and reports
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('notes')}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <StickyNote className="h-8 w-8 text-chart-1" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-2xl font-bold">{notes?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('todos')}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckSquare className="h-8 w-8 text-chart-2" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Todos</p>
                      <p className="text-2xl font-bold">{getTodosStats().pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('labels')}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Tag className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Labels</p>
                      <p className="text-2xl font-bold">{labels?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('reports')}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-chart-5" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Reports</p>
                      <p className="text-2xl font-bold">{reportStats?.pending || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="todos" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="labels" className="gap-2">
                <Tag className="h-4 w-4" />
                Labels
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Settings className="h-4 w-4" />
                Tools
              </TabsTrigger>
            </TabsList>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Notes</h2>
                <div className="flex items-center gap-2">
                  <Select value={notesGroupBy} onValueChange={(value: 'question' | 'date' | 'none') => setNotesGroupBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">By Question</SelectItem>
                      <SelectItem value="date">By Date</SelectItem>
                      <SelectItem value="none">No Grouping</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={showCreateNoteDialog} onOpenChange={setShowCreateNoteDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Note</DialogTitle>
                        <DialogDescription>
                          Add a new note to organize your study materials
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="noteText">Note Content</Label>
                          <Textarea
                            id="noteText"
                            placeholder="Write your note content..."
                            rows={10}
                            value={noteForm.noteText}
                            onChange={(e) => setNoteForm(prev => ({ ...prev, noteText: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="questionId">Question ID (Optional)</Label>
                          <Input
                            id="questionId"
                            type="number"
                            placeholder="Enter question ID to associate this note with a question"
                            value={noteForm.questionId || ''}
                            onChange={(e) => setNoteForm(prev => ({
                              ...prev,
                              questionId: e.target.value ? parseInt(e.target.value) : undefined
                            }))}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave empty for general notes
                          </p>
                        </div>

                        <div>
                          <Label>Labels</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {labels?.map((label) => (
                              <Badge
                                key={label.id}
                                variant={noteForm.labelIds.includes(label.id) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  setNoteForm(prev => ({
                                    ...prev,
                                    labelIds: prev.labelIds.includes(label.id)
                                      ? prev.labelIds.filter(id => id !== label.id)
                                      : [...prev.labelIds, label.id]
                                  }));
                                }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateNoteDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateNote}>
                            Create Note
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={notesFilters.search}
                    onChange={(e) => handleNotesSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={notesFilters.labelIds.length > 0 ? notesFilters.labelIds[0].toString() : 'all'}
                  onValueChange={(value) => updateNotesFilters({
                    labelIds: value === 'all' ? [] : [parseInt(value)]
                  })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labels</SelectItem>
                    {labels?.map((label) => (
                      <SelectItem key={label.id} value={label.id.toString()}>
                        {label.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes Display */}
              <DataLoadingState
                loading={notesLoading}
                error={notesError}
                onRetry={refreshNotes}
                data={notes}
                emptyMessage="No notes found. Create your first note to get started!"
                loadingComponent={<DashboardLoadingSkeleton />}
              >
                <div className="space-y-6 mb-8">
                  {Object.entries(groupedNotes).map(([groupKey, groupNotes]) => {
                    const questionInfo = getQuestionInfo(groupKey, groupNotes);
                    const isExpanded = expandedQuestions.has(questionInfo.id) || notesGroupBy === 'none';

                    return (
                      <div key={groupKey} className="space-y-4">
                        {/* Group Header */}
                        {notesGroupBy !== 'none' && (
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 p-2 h-auto"
                              onClick={() => toggleQuestionExpansion(questionInfo.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}

                              <div className="flex items-center gap-2">
                                {questionInfo.isGeneral ? (
                                  <StickyNote className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <MessageSquare className="h-5 w-5 text-primary" />
                                )}

                                <div className="text-left">
                                  <h3 className="font-semibold text-lg">
                                    {questionInfo.isGeneral ? 'General Notes' : 'Question Notes'}
                                  </h3>
                                  {!questionInfo.isGeneral && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                                      {questionInfo.questionText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Button>

                            <Badge variant="secondary" className="ml-2">
                              {groupNotes.length} {groupNotes.length === 1 ? 'note' : 'notes'}
                            </Badge>
                          </div>
                        )}

                        {/* Notes Grid/List */}
                        {(isExpanded || notesGroupBy === 'none') && (
                          <div className={cn(
                            "grid gap-4",
                            viewMode === 'grid'
                              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                              : "grid-cols-1"
                          )}>
                            {groupNotes.map((note) => (
                              <Card
                                key={note.id}
                                className={cn(
                                  "card-hover-lift group",
                                  viewMode === 'list' && "flex flex-row"
                                )}
                              >
                                <div className="flex-1">
                                  <CardHeader className={cn(viewMode === 'list' && "pb-2")}>
                                    <div className="flex items-start justify-between">
                                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                        {note.noteText.length > 100
                                          ? `${note.noteText.substring(0, 100)}...`
                                          : note.noteText}
                                      </CardTitle>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditNoteDialog(note)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    <CardDescription className="line-clamp-3">
                                      {note.noteText}
                                    </CardDescription>
                                  </CardHeader>

                                  <CardContent className="space-y-3">
                                    {/* Labels */}
                                    {note.labelIds && note.labelIds.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {note.labelIds.map((labelId) => {
                                          const label = getLabelById(labelId);
                                          return label ? (
                                            <Badge key={labelId} variant="secondary" className="text-xs">
                                              {label.name}
                                            </Badge>
                                          ) : null;
                                        })}
                                      </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(note.createdAt)}</span>
                                      </div>

                                      {note.questionId && notesGroupBy === 'none' && (
                                        <div className="flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" />
                                          <span>Question Note</span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {notesPagination && notesPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((notesPagination.page - 1) * notesPagination.limit) + 1} to{' '}
                      {Math.min(notesPagination.page * notesPagination.limit, notesPagination.total)} of{' '}
                      {notesPagination.total} notes
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!notesPagination.hasPrev}
                        onClick={() => updateNotesFilters({ page: notesFilters.page - 1 })}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!notesPagination.hasNext}
                        onClick={() => updateNotesFilters({ page: notesFilters.page + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </DataLoadingState>
            </TabsContent>

            {/* Todos Tab */}
            <TabsContent value="todos" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Todos</h2>
                <Dialog open={showCreateTodoDialog} onOpenChange={setShowCreateTodoDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Todo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Todo</DialogTitle>
                      <DialogDescription>
                        Add a new task to your todo list
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter todo title..."
                          value={todoForm.title}
                          onChange={(e) => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Add more details..."
                          rows={3}
                          value={todoForm.description}
                          onChange={(e) => setTodoForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dueDate">Due Date (Optional)</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={todoForm.dueDate}
                            onChange={(e) => setTodoForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={todoForm.priority}
                            onValueChange={(value) => setTodoForm(prev => ({ ...prev, priority: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateTodoDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTodo}>
                          Create Todo
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{getTodosStats().total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{getTodosStats().completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-chart-1" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{getTodosStats().pending}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                        <p className="text-2xl font-bold">{getTodosStats().overdue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search todos..."
                    value={todosFilters.search}
                    onChange={(e) => updateTodosFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={todosFilters.status}
                  onValueChange={(value) => updateTodosFilters({ status: value as any })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Todos</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={todosFilters.priority}
                  onValueChange={(value) => updateTodosFilters({ priority: value as any })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Todos List */}
              <DataLoadingState
                loading={todosLoading}
                error={todosError}
                onRetry={refreshTodos}
                data={todos}
                emptyMessage="No todos found. Create your first todo to get started!"
                loadingComponent={<DashboardLoadingSkeleton />}
              >
                <div className="space-y-3 mb-8">
                  {todos?.map((todo) => {
                    const PriorityIcon = getPriorityIcon(todo.priority);
                    const overdue = isOverdue(todo);

                    return (
                      <Card
                        key={todo.id}
                        className={cn(
                          "card-hover-lift",
                          todo.status === 'COMPLETED' && "opacity-60",
                          overdue && todo.status !== 'COMPLETED' && "border-destructive/20 bg-destructive/5"
                        )}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <Checkbox
                              checked={todo.status === 'COMPLETED'}
                              onCheckedChange={() => handleToggleComplete(todo)}
                              className="mt-1"
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className={cn(
                                    "font-medium text-lg",
                                    todo.status === 'COMPLETED' && "line-through text-muted-foreground"
                                  )}>
                                    {todo.title}
                                  </h3>

                                  {todo.description && (
                                    <p className="text-muted-foreground text-sm mt-1">
                                      {todo.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-3 mt-3">
                                    {/* Priority */}
                                    <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                                      <PriorityIcon className="h-3 w-3 mr-1" />
                                      {todo.priority}
                                    </Badge>

                                    {/* Due Date */}
                                    {todo.dueDate && (
                                      <div className={cn(
                                        "flex items-center gap-1 text-xs",
                                        overdue ? "text-red-600" : "text-muted-foreground"
                                      )}>
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(todo.dueDate)}</span>
                                        {overdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                                      </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>Created {formatDate(todo.createdAt)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditTodoDialog(todo)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteTodo(todo.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {todosPagination && todosPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((todosPagination.page - 1) * todosPagination.limit) + 1} to{' '}
                      {Math.min(todosPagination.page * todosPagination.limit, todosPagination.total)} of{' '}
                      {todosPagination.total} todos
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!todosPagination.hasPrev}
                        onClick={() => updateTodosFilters({ page: todosFilters.page - 1 })}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!todosPagination.hasNext}
                        onClick={() => updateTodosFilters({ page: todosFilters.page + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </DataLoadingState>
            </TabsContent>

            {/* Labels Tab */}
            <TabsContent value="labels" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Labels</h2>
                <Dialog open={showCreateLabelDialog} onOpenChange={setShowCreateLabelDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Label
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Label</DialogTitle>
                      <DialogDescription>
                        Add a new label to organize your study materials
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter label name..."
                          value={labelForm.name}
                          onChange={(e) => setLabelForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateLabelDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateLabel}>
                          Create Label
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search labels..."
                  value={labelsSearchTerm}
                  onChange={(e) => setLabelsSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Labels Grid */}
              <DataLoadingState
                loading={labelsLoading}
                error={labelsError}
                onRetry={refreshLabels}
                data={labels}
                emptyMessage="No labels found. Create your first label to get started!"
                loadingComponent={<DashboardLoadingSkeleton />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLabels.map((label) => (
                    <Card key={label.id} className="card-hover-lift group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {label.name}
                            </CardTitle>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditLabelDialog(label)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteLabel(label.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>


                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        {/* Usage Statistics */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-chart-1" />
                            <span className="text-muted-foreground">Quizzes:</span>
                            <span className="font-medium">{label.statistics.quizzesCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HelpCircle className="h-3 w-3 text-chart-2" />
                            <span className="text-muted-foreground">Questions:</span>
                            <span className="font-medium">{label.statistics.questionsCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">Sessions:</span>
                            <span className="font-medium">{label.statistics.quizSessionsCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3 text-orange-500" />
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">{label.statistics.totalItems}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(label.createdAt)}</span>
                          </div>

                          <Badge variant="outline" className="text-xs">
                            <Hash className="h-2 w-2 mr-1" />
                            {label.name.toLowerCase().replace(/\s+/g, '')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty state for search */}
                {labelsSearchTerm && filteredLabels.length === 0 && labels && labels.length > 0 && (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No labels found</h3>
                    <p className="text-muted-foreground">
                      No labels match your search for "{labelsSearchTerm}"
                    </p>
                  </div>
                )}
              </DataLoadingState>

              {/* Usage Statistics */}
              {labels && labels.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Label Usage Statistics
                    </CardTitle>
                    <CardDescription>
                      Overview of how your labels are being used across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Basic Stats */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{labels.length}</div>
                        <div className="text-sm text-muted-foreground">Total Labels</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {labels.reduce((sum, label) => sum + label.statistics.quizzesCount, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tagged Quizzes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {labels.reduce((sum, label) => sum + label.statistics.questionsCount, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tagged Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {labels.reduce((sum, label) => sum + label.statistics.quizSessionsCount, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tagged Sessions</div>
                      </div>
                    </div>

                    {/* Most Used Labels */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Most Active Labels
                      </h4>
                      <div className="space-y-2">
                        {labels
                          .filter(label => label.statistics.totalItems > 0)
                          .sort((a, b) => b.statistics.totalItems - a.statistics.totalItems)
                          .slice(0, 5)
                          .map((label) => (
                            <div key={label.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3 text-primary" />
                                <span className="font-medium">{label.name}</span>
                              </div>
                              <Badge variant="secondary">
                                {label.statistics.totalItems} items
                              </Badge>
                            </div>
                          ))}
                        {labels.every(label => label.statistics.totalItems === 0) && (
                          <div className="text-center py-4 text-muted-foreground">
                            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No labels have been used yet</p>
                            <p className="text-xs">Start tagging your quizzes and questions to see usage statistics</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="text-lg font-semibold">
                            {labels.filter(l => l.statistics.totalItems > 0).length}
                          </div>
                          <div className="text-muted-foreground">Active Labels</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {labels.filter(l => l.statistics.totalItems === 0).length}
                          </div>
                          <div className="text-muted-foreground">Unused Labels</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Question Reports</h2>
                <Dialog open={showCreateReportDialog} onOpenChange={setShowCreateReportDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Report Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Report Question Issue</DialogTitle>
                      <DialogDescription>
                        Help us improve by reporting issues with questions
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="questionId">Question ID</Label>
                        <Input
                          id="questionId"
                          placeholder="Enter question ID..."
                          value={reportForm.questionId}
                          onChange={(e) => setReportForm(prev => ({ ...prev, questionId: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="reportType">Issue Type</Label>
                        <Select
                          value={reportForm.reportType}
                          onValueChange={(value) => setReportForm(prev => ({ ...prev, reportType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(reportTypeConfig).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="h-4 w-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the issue in detail..."
                          rows={6}
                          value={reportForm.description}
                          onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateReportDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateReport}>
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Statistics Cards */}
              {!reportStatsLoading && reportStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                          <p className="text-2xl font-bold">{reportStats.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending</p>
                          <p className="text-2xl font-bold text-blue-600">{reportStats.pending}</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                          <p className="text-2xl font-bold text-yellow-600">{reportStats.reviewed || 0}</p>
                        </div>
                        <Eye className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                          <p className="text-2xl font-bold text-green-600">{reportStats.resolved}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                          <p className="text-2xl font-bold text-red-600">{reportStats.rejected}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={reportsFilters.search}
                    onChange={(e) => handleReportsSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={reportsFilters.status}
                  onValueChange={(value) => updateReportsFilters({ status: value as any })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={reportsFilters.reportType}
                  onValueChange={(value) => updateReportsFilters({ reportType: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(reportTypeConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reports List */}
              <DataLoadingState
                loading={reportsLoading}
                error={reportsError}
                onRetry={refreshReports}
                data={reports}
                emptyMessage="No reports found. Report your first question issue to get started!"
                loadingComponent={<DashboardLoadingSkeleton />}
              >
                <div className="grid gap-4 mb-8">
                  {reports?.map((report) => {
                    const typeConfig = getReportTypeConfig(report.reportType);
                    const statusConfigItem = getStatusConfig(report.status);
                    const TypeIcon = typeConfig.icon;
                    const StatusIcon = statusConfigItem.icon;

                    return (
                      <Card key={report.id} className="hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2 rounded-lg", typeConfig.color)}>
                                <TypeIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg">
                                  Question #{report.question?.id || report.questionId}
                                </CardTitle>
                                {report.question?.questionText && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {report.question.questionText}
                                  </p>
                                )}
                                <CardDescription className="line-clamp-2 mt-2">
                                  <strong>Issue:</strong> {report.description}
                                </CardDescription>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={statusConfigItem.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfigItem.label}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Admin Response Preview */}
                          {report.adminResponse && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Admin Response</span>
                                {report.reviewedBy && (
                                  <span className="text-xs text-green-600">by {report.reviewedBy.fullName}</span>
                                )}
                              </div>
                              <p className="text-sm text-green-700 line-clamp-2">
                                {report.adminResponse}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(report.createdAt)}</span>
                              </div>
                              <Badge variant="secondary" className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              {report.adminResponse && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span className="text-xs">Responded</span>
                                </div>
                              )}
                              {report.updatedAt !== report.createdAt && (
                                <div className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  <span className="text-xs">Updated {formatDate(report.updatedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {reportsPagination && reportsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((reportsPagination.page - 1) * reportsPagination.limit) + 1} to{' '}
                      {Math.min(reportsPagination.page * reportsPagination.limit, reportsPagination.total)} of{' '}
                      {reportsPagination.total} reports
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!reportsPagination.hasPrev}
                        onClick={() => updateReportsFilters({ page: reportsFilters.page - 1 })}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!reportsPagination.hasNext}
                        onClick={() => updateReportsFilters({ page: reportsFilters.page + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </DataLoadingState>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Organization Tools</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common workspace actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowCreateNoteDialog(true)}
                    >
                      <StickyNote className="h-4 w-4" />
                      Create Note
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowCreateTodoDialog(true)}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Add Todo
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowCreateLabelDialog(true)}
                    >
                      <Tag className="h-4 w-4" />
                      New Label
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowCreateReportDialog(true)}
                    >
                      <FileText className="h-4 w-4" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>

                {/* Workspace Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Workspace Overview
                    </CardTitle>
                    <CardDescription>
                      Your organization summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Notes</span>
                      <Badge variant="secondary">{notes?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Todos</span>
                      <Badge variant="secondary">{getTodosStats().pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Labels</span>
                      <Badge variant="secondary">{labels?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Reports</span>
                      <Badge variant="secondary">{reportStats?.pending || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Refresh Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Refresh Data
                    </CardTitle>
                    <CardDescription>
                      Update your workspace data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={refreshNotes}
                      disabled={notesLoading}
                    >
                      <StickyNote className="h-4 w-4" />
                      Refresh Notes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={refreshTodos}
                      disabled={todosLoading}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Refresh Todos
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={refreshLabels}
                      disabled={labelsLoading}
                    >
                      <Tag className="h-4 w-4" />
                      Refresh Labels
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={refreshReports}
                      disabled={reportsLoading}
                    >
                      <FileText className="h-4 w-4" />
                      Refresh Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Note Dialog */}
          <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogDescription>
                  Update your note content and labels
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-noteText">Note Content</Label>
                  <Textarea
                    id="edit-noteText"
                    placeholder="Write your note content..."
                    rows={10}
                    value={noteForm.noteText}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, noteText: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-questionId">Question ID (Optional)</Label>
                  <Input
                    id="edit-questionId"
                    type="number"
                    placeholder="Enter question ID to associate this note with a question"
                    value={noteForm.questionId || ''}
                    onChange={(e) => setNoteForm(prev => ({
                      ...prev,
                      questionId: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for general notes
                  </p>
                </div>

                <div>
                  <Label>Labels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {labels?.map((label) => (
                      <Badge
                        key={label.id}
                        variant={noteForm.labelIds.includes(label.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setNoteForm(prev => ({
                            ...prev,
                            labelIds: prev.labelIds.includes(label.id)
                              ? prev.labelIds.filter(id => id !== label.id)
                              : [...prev.labelIds, label.id]
                          }));
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingNote(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditNote}>
                    Update Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Todo Dialog */}
          <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Todo</DialogTitle>
                <DialogDescription>
                  Update your todo details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Enter todo title..."
                    value={todoForm.title}
                    onChange={(e) => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Add more details..."
                    rows={3}
                    value={todoForm.description}
                    onChange={(e) => setTodoForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-dueDate">Due Date (Optional)</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={todoForm.dueDate}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={todoForm.priority}
                      onValueChange={(value) => setTodoForm(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTodo(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditTodo}>
                    Update Todo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Label Dialog */}
          <Dialog open={!!editingLabel} onOpenChange={(open) => !open && setEditingLabel(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Label</DialogTitle>
                <DialogDescription>
                  Update your label name
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter label name..."
                    value={labelForm.name}
                    onChange={(e) => setLabelForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingLabel(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditLabel}>
                    Update Label
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Report Details Dialog */}
          <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>
                  Question #{selectedReport?.question?.id || selectedReport?.questionId} - {selectedReport && getReportTypeConfig(selectedReport.reportType).label}
                </DialogDescription>
              </DialogHeader>

              {selectedReport && (
                <div className="space-y-6">
                  {/* Question Details */}
                  {selectedReport.question && (
                    <div>
                      <Label className="text-base font-semibold">Question</Label>
                      <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm">{selectedReport.question.questionText}</p>
                      </div>
                    </div>
                  )}

                  {/* Status and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusConfig(selectedReport.status).color}>
                          {getStatusConfig(selectedReport.status).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={getReportTypeConfig(selectedReport.reportType).color}>
                          {getReportTypeConfig(selectedReport.reportType).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* User's Report Description */}
                  <div>
                    <Label className="text-base font-semibold">Your Report</Label>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {selectedReport.adminResponse && (
                    <div>
                      <Label className="text-base font-semibold">Admin Response</Label>
                      {selectedReport.reviewedBy && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reviewed by {selectedReport.reviewedBy.fullName}
                        </p>
                      )}
                      <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm whitespace-pre-wrap text-green-800">{selectedReport.adminResponse}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                    <div>
                      <Label>Created</Label>
                      <p className="text-muted-foreground">{formatDateTime(selectedReport.createdAt)}</p>
                    </div>
                    <div>
                      <Label>Last Updated</Label>
                      <p className="text-muted-foreground">{formatDateTime(selectedReport.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ErrorBoundary>
  );
}
