// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  Flag,
  AlertTriangle,
  BookOpen,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';
import { QuestionReportDialog } from '@/components/student/session-analysis/question-report-dialog';

export function QuestionActions() {
  const { state, revealAnswer, toggleExplanation, bookmarkQuestion, addNote, flagQuestion } = useQuiz();
  const { session, currentQuestion, isAnswerRevealed, showExplanation } = state;
  
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');

  const userAnswer = session.userAnswers[currentQuestion.id];
  const isBookmarked = userAnswer?.isBookmarked || false;
  const flags = userAnswer?.flags || [];
  const existingNote = userAnswer?.notes || '';
  const hasAnswered = userAnswer && (userAnswer.selectedOptions?.length || userAnswer.textAnswer);

  const handleSaveNote = () => {
    addNote(currentQuestion.id, noteText);
    setShowNoteDialog(false);
    setNoteText('');
  };

  const handleOpenNoteDialog = () => {
    setNoteText(existingNote);
    setShowNoteDialog(true);
  };

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="flex items-center gap-1">
          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bookmarkQuestion(currentQuestion.id)}
            className={cn(
              "gap-1",
              isBookmarked && "text-yellow-600"
            )}
          >
            <Star className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            <span className="hidden sm:inline">
              {isBookmarked ? 'Retiré' : 'Favori'}
            </span>
          </Button>

          {/* Add Note */}
          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenNoteDialog}
                className={cn(
                  "gap-1",
                  existingNote && "text-blue-600"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Note personnelle</DialogTitle>
                <DialogDescription>
                  Ajoutez une note pour vous souvenir de cette question
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Tapez votre note ici..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveNote}>
                  <Check className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>



          {/* Report Question */}
          <QuestionReportDialog
            questionId={parseInt(currentQuestion.id)}
            questionText={currentQuestion.title || currentQuestion.content || currentQuestion.questionText || `Question ${currentQuestion.id}`}
            questionType={currentQuestion.type}
            onReportSubmitted={() => flagQuestion(currentQuestion.id, 'report_error')}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1",
                flags.includes('report_error') && "text-orange-600"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Signaler</span>
            </Button>
          </QuestionReportDialog>
        </div>

      {/* Existing Note Display */}
      {existingNote && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Votre note :</h4>
                <p className="text-sm text-blue-800">{existingNote}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Flags Display */}
      {flags.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Marqueurs :</span>
          {flags.includes('report_error') && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Erreur signalée</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
