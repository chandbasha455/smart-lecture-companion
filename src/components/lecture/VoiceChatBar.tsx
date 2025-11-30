import { Mic, MicOff, Volume2, VolumeX, Send, MessageCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types/lecture';
import { cn } from '@/lib/utils';

interface VoiceChatBarProps {
  messages: ChatMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
  onSendMessage: (message: string) => void;
}

export const VoiceChatBar = ({
  messages,
  isListening,
  isSpeaking,
  onToggleVoice,
  onStopSpeaking,
  onSendMessage
}: VoiceChatBarProps) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "glass-panel transition-all duration-300 ease-out",
      isExpanded ? "h-80" : "h-auto"
    )}>
      {/* Chat Messages */}
      {isExpanded && (
        <div className="h-48 overflow-y-auto scrollbar-thin p-4 border-b border-border/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Ask questions about the lecture
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2 fade-in",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                    {msg.isAudio && (
                      <span className="ml-2 text-xs opacity-70">🎤</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}
      
      {/* Input Bar */}
      <div className="p-4 flex items-center gap-3">
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0"
        >
          <MessageCircle className={cn(
            "w-5 h-5 transition-colors",
            isExpanded ? "text-primary" : "text-muted-foreground"
          )} />
        </Button>
        
        {/* Voice Button */}
        <Button
          variant={isListening ? 'recording' : 'outline'}
          size="icon-lg"
          onClick={onToggleVoice}
          className="flex-shrink-0 rounded-full"
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
        
        {/* Speaking Indicator / Stop Button */}
        {isSpeaking && (
          <Button
            variant="outline"
            size="icon"
            onClick={onStopSpeaking}
            className="flex-shrink-0"
          >
            <VolumeX className="w-5 h-5 text-accent" />
          </Button>
        )}
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the lecture..."
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Voice Activity Indicator */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full voice-wave",
                  isListening ? "bg-destructive" : "bg-accent"
                )}
                style={{
                  height: `${12 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
