import { useCallback, useState, useEffect, useRef } from 'react';
import { TopBar } from '@/components/lecture/TopBar';
import { ScreenPreview } from '@/components/lecture/ScreenPreview';
import { LiveNotesPanel } from '@/components/lecture/LiveNotesPanel';
import { HistoryPanel } from '@/components/lecture/HistoryPanel';
import { QuizPanel } from '@/components/lecture/QuizPanel';
import { VoiceChatBar } from '@/components/lecture/VoiceChatBar';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLectureStore } from '@/hooks/useLectureStore';
import { useToast } from '@/hooks/use-toast';
import { useAINotesGenerator } from '@/hooks/useAINotesGenerator';
import { useChatAssistant } from '@/hooks/useChatAssistant';

const Index = () => {
  const { toast } = useToast();
  const [chatListening, setChatListening] = useState(false);
  const pendingTranscriptRef = useRef<string>('');
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    currentSession,
    sessions,
    liveBullets,
    quizQuestions,
    chatMessages,
    isGeneratingQuiz,
    startNewSession,
    addBullet,
    endSession,
    generateQuiz,
    clearQuiz,
    addChatMessage
  } = useLectureStore();

  const { isCapturing, currentFrame, startCapture, stopCapture } = useScreenCapture();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const { askQuestion, isProcessing: isChatProcessing } = useChatAssistant({ liveBullets });

  // AI Notes Generator
  const handleAIBullets = useCallback((bullets: string[]) => {
    bullets.forEach(bullet => {
      addBullet(bullet);
    });
    toast({
      title: "Notes Generated",
      description: `Added ${bullets.length} bullet points from AI analysis`,
    });
  }, [addBullet, toast]);

  const handleAIError = useCallback((error: string) => {
    toast({
      title: "AI Analysis Error",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const { analyzeContent, isProcessing } = useAINotesGenerator({
    onBulletsGenerated: handleAIBullets,
    onError: handleAIError
  });

  // Collect transcript for AI analysis
  const processBulletPoint = useCallback((text: string) => {
    pendingTranscriptRef.current += ' ' + text;
  }, []);

  const {
    isListening: isNotesListening,
    interimTranscript,
    toggleListening: toggleNotesListening
  } = useVoiceRecognition(processBulletPoint);

  // Store currentFrame in a ref to avoid effect re-runs
  const currentFrameRef = useRef<string | null>(null);
  
  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  // Trigger AI analysis every 30 seconds when capturing (to avoid rate limits)
  useEffect(() => {
    console.log("📸 Screen capture state changed:", { isCapturing });
    
    if (isCapturing) {
      // Initial analysis after 10 seconds
      const initialTimeout = setTimeout(() => {
        const frame = currentFrameRef.current;
        console.log("⏱️ Initial timeout triggered, frame:", !!frame);
        if (frame) {
          analyzeContent(frame, pendingTranscriptRef.current || null);
          pendingTranscriptRef.current = '';
        }
      }, 10000);

      // Regular analysis every 30 seconds to avoid rate limits
      analysisIntervalRef.current = setInterval(() => {
        const frame = currentFrameRef.current;
        console.log("⏱️ Interval triggered, frame:", !!frame);
        if (frame) {
          analyzeContent(frame, pendingTranscriptRef.current || null);
          pendingTranscriptRef.current = '';
        }
      }, 30000);

      return () => {
        clearTimeout(initialTimeout);
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    } else {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    }
  }, [isCapturing, analyzeContent]);

  // Handle chat voice input
  const handleChatTranscript = useCallback(async (text: string) => {
    addChatMessage(text, 'user', true);
    setChatListening(false);
    
    const response = await askQuestion(text);
    addChatMessage(response, 'assistant');
    speak(response);
  }, [addChatMessage, speak, askQuestion]);

  const {
    isListening: isChatListening,
    toggleListening: toggleChatListening
  } = useVoiceRecognition(handleChatTranscript);

  const handleStartSession = useCallback(() => {
    startNewSession('New Lecture');
    toast({
      title: "Session Started",
      description: "Your lecture session is now active. Start capturing notes!",
    });
  }, [startNewSession, toast]);

  const handleEndSession = useCallback(() => {
    if (isCapturing) stopCapture();
    if (isNotesListening) toggleNotesListening();
    endSession();
    toast({
      title: "Session Ended",
      description: `Captured ${liveBullets.length} bullet points. Session saved to history.`,
    });
  }, [isCapturing, isNotesListening, stopCapture, toggleNotesListening, endSession, liveBullets.length, toast]);

  const handleToggleChatVoice = useCallback(() => {
    if (isChatListening) {
      setChatListening(false);
    } else {
      setChatListening(true);
    }
    toggleChatListening();
  }, [isChatListening, toggleChatListening]);

  const handleSendTextMessage = useCallback(async (text: string) => {
    addChatMessage(text, 'user');
    
    const response = await askQuestion(text);
    addChatMessage(response, 'assistant');
    speak(response);
  }, [addChatMessage, speak, askQuestion]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none opacity-50" />
      
      {/* Top Bar */}
      <TopBar
        currentSession={currentSession}
        isRecording={isNotesListening || isCapturing}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        bullets={liveBullets}
        quizQuestions={quizQuestions}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 relative z-10">
        {/* Left Column - Screen + Notes */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="h-[280px]">
            <ScreenPreview
              isCapturing={isCapturing}
              currentFrame={currentFrame}
              onStart={startCapture}
              onStop={stopCapture}
            />
          </div>
          <div className="flex-1 min-h-[300px]">
            <LiveNotesPanel
              bullets={liveBullets}
              isListening={isNotesListening}
              interimTranscript={interimTranscript}
              onToggleListening={toggleNotesListening}
              isAIProcessing={isProcessing}
            />
          </div>
        </div>
        
        {/* Center Column - History */}
        <div className="col-span-12 lg:col-span-3">
          <HistoryPanel
            sessions={sessions}
            currentSession={currentSession}
          />
        </div>
        
        {/* Right Column - Quiz */}
        <div className="col-span-12 lg:col-span-4">
        <QuizPanel
            questions={quizQuestions}
            isGenerating={isGeneratingQuiz}
            onGenerate={generateQuiz}
            onClear={clearQuiz}
            hasBullets={liveBullets.length > 0 || sessions.some(s => s.bullets.length > 0)}
            sessions={sessions}
            currentSession={currentSession}
          />
        </div>
      </main>
      
      {/* Bottom Voice Chat Bar */}
      <div className="p-4 pt-0 relative z-10">
        <VoiceChatBar
          messages={chatMessages}
          isListening={isChatListening}
          isSpeaking={isSpeaking}
          onToggleVoice={handleToggleChatVoice}
          onStopSpeaking={stopSpeaking}
          onSendMessage={handleSendTextMessage}
        />
      </div>
    </div>
  );
};

export default Index;
