// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuestionReporting } from '@/hooks/use-session-analysis';
import { toast } from 'sonner';

// Report types based on API validation response
const REPORT_TYPES = [
  {
    value: 'INCORRECT_ANSWER',
    label: 'Réponse incorrecte',
    description: 'La réponse marquée comme correcte semble être incorrecte'
  },
  {
    value: 'UNCLEAR_QUESTION',
    label: 'Question peu claire',
    description: 'La question est ambiguë ou difficile à comprendre'
  },
  {
    value: 'TYPO',
    label: 'Erreur de frappe',
    description: 'Faute d\'orthographe ou erreur typographique'
  },
  {
    value: 'INAPPROPRIATE',
    label: 'Contenu inapproprié',
    description: 'Contenu offensant ou inapproprié'
  },
  {
    value: 'OTHER',
    label: 'Autre',
    description: 'Autre problème non listé ci-dessus'
  }
];

interface QuestionReportDialogProps {
  questionId: number;
  questionText?: string;
  questionType?: string;
  onReportSubmitted?: () => void;
  children: React.ReactNode;
}

export function QuestionReportDialog({
  questionId,
  questionText,
  questionType,
  onReportSubmitted,
  children
}: QuestionReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  const [description, setDescription] = useState('');
  
  const { submitting, error, success, reportQuestion, resetState } = useQuestionReporting();

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      toast.error('Veuillez sélectionner un type de problème et fournir une description');
      return;
    }

    try {
      await reportQuestion(questionId, {
        reportType,
        description: description.trim()
      });

      // Success handling
      toast.success('Signalement envoyé avec succès');
      setOpen(false);
      setReportType('');
      setDescription('');
      resetState();
      
      // Call the callback if provided
      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (error) {
      // Error is already handled by the hook and toast
      console.error('Report submission failed:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setReportType('');
      setDescription('');
      resetState();
    }
  };

  const selectedReportType = REPORT_TYPES.find(type => type.value === reportType);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Signaler un problème avec cette question
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à améliorer la qualité des questions en signalant les problèmes que vous rencontrez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Question #{questionId}</span>
              {questionType && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {questionType}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">
              {questionText && questionText.length > 200
                ? `${questionText.substring(0, 200)}...`
                : questionText || 'Question text not available'
              }
            </p>
          </div>

          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Type de problème *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de problème" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReportType && (
              <p className="text-xs text-muted-foreground">
                {selectedReportType.description}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères. Soyez aussi précis que possible.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reportType || !description.trim() || description.trim().length < 10}
            className="gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer le signalement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
