import { Brain, RefreshCw, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/types/lecture';
import { cn } from '@/lib/utils';

interface QuizPanelProps {
  questions: QuizQuestion[];
  isGenerating: boolean;
  onGenerate: (count: number) => void;
  onClear: () => void;
  hasBullets: boolean;
}

export const QuizPanel = ({
  questions,
  isGenerating,
  onGenerate,
  onClear,
  hasBullets
}: QuizPanelProps) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());

  const questionCounts = [5, 10, 15, 20];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleShowAnswer = (questionId: string) => {
    setShowAnswers(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium text-foreground">Quiz Generator</h3>
        </div>
        
        {questions.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      
      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Brain className="w-12 h-12 text-accent opacity-50 mb-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">
            Generate quiz questions from your lecture notes
          </p>
          
          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Number of questions:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {questionCounts.map(count => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      questionCount === count
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              variant="glow"
              className="w-full bg-gradient-accent"
              onClick={() => onGenerate(questionCount)}
              disabled={isGenerating || !hasBullets}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
            
            {!hasBullets && (
              <p className="text-xs text-muted-foreground text-center">
                Add some notes first to generate a quiz
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 fade-in">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                    {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'fill-blank' ? 'Fill in the Blank' : 'Short Answer'}
                  </span>
                  <p className="text-sm text-foreground mb-3">{q.question}</p>
                  
                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2">
                      {q.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(q.id, option)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            answers[q.id] === option
                              ? showAnswers.has(q.id)
                                ? option === q.answer
                                  ? "bg-success/20 text-success border border-success/50"
                                  : "bg-destructive/20 text-destructive border border-destructive/50"
                                : "bg-accent/20 text-accent border border-accent/50"
                              : "bg-muted/50 text-foreground/80 hover:bg-muted"
                          )}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {q.type === 'fill-blank' && (
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                  
                  {q.type === 'short-answer' && (
                    <textarea
                      placeholder="Type your answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => toggleShowAnswer(q.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showAnswers.has(q.id) ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    
                    {showAnswers.has(q.id) && (
                      <div className="flex items-center gap-1 text-xs">
                        <Check className="w-3 h-3 text-success" />
                        <span className="text-muted-foreground">
                          {q.answer.substring(0, 50)}{q.answer.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="sticky bottom-0 pt-3 pb-1 bg-gradient-to-t from-card to-transparent">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onGenerate(questionCount)}
              disabled={isGenerating}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
              Regenerate Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
