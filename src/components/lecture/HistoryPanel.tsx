import { History, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Session } from '@/types/lecture';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  sessions: Session[];
  currentSession: Session | null;
}

export const HistoryPanel = ({ sessions, currentSession }: HistoryPanelProps) => {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const allSessions = currentSession 
    ? [{ ...currentSession, name: 'Current Session' }, ...sessions]
    : sessions;

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">History</h3>
        <span className="text-xs text-muted-foreground">({sessions.length} sessions)</span>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 min-h-[300px]">
        {allSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Calendar className="w-10 h-10 text-muted-foreground opacity-50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No session history yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete sessions will appear here
            </p>
          </div>
        ) : (
          allSessions.map((session, index) => {
            const isExpanded = expandedSessions.has(session.id);
            const isCurrent = index === 0 && currentSession;
            
            return (
              <div
                key={session.id}
                className={cn(
                  "rounded-lg border border-border/50 overflow-hidden",
                  isCurrent && "border-primary/50 bg-primary/5"
                )}
              >
                <button
                  onClick={() => toggleSession(session.id)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {session.name}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(session.timestamp)}</span>
                      <span>•</span>
                      <span>{session.bullets.length} notes</span>
                    </div>
                  </div>
                </button>
                
                {isExpanded && session.bullets.length > 0 && (
                  <div className="px-3 pb-3 border-t border-border/30">
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                      {session.bullets.map(bullet => (
                        <div
                          key={bullet.id}
                          className="bullet-item text-xs text-foreground/80"
                        >
                          {bullet.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
