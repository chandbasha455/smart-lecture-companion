import { useState, useCallback } from 'react';
import { BulletPoint, Session, QuizQuestion, ChatMessage } from '@/types/lecture';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useLectureStore = () => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveBullets, setLiveBullets] = useState<BulletPoint[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const startNewSession = useCallback((topic: string = 'New Lecture') => {
    const session: Session = {
      id: generateId(),
      name: `Session_${new Date().toLocaleDateString().replace(/\//g, '')}`,
      topic,
      timestamp: new Date(),
      bullets: []
    };
    setCurrentSession(session);
    setLiveBullets([]);
    setQuizQuestions([]);
  }, []);

  const addBullet = useCallback((text: string) => {
    const bullet: BulletPoint = {
      id: generateId(),
      text: text.trim(),
      timestamp: new Date()
    };
    setLiveBullets(prev => [...prev, bullet]);
    
    // Also update current session
    setCurrentSession(prev => prev ? {
      ...prev,
      bullets: [...prev.bullets, bullet]
    } : null);
  }, []);

  const endSession = useCallback(() => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        bullets: liveBullets
      };
      setSessions(prev => [completedSession, ...prev]);
      setCurrentSession(null);
    }
  }, [currentSession, liveBullets]);

  const generateQuiz = useCallback(async (questionCount: number, sessionId?: string) => {
    setIsGeneratingQuiz(true);
    
    // Get bullets based on session selection
    let allBullets;
    if (sessionId) {
      // Find specific session
      const targetSession = sessionId === currentSession?.id 
        ? currentSession 
        : sessions.find(s => s.id === sessionId);
      allBullets = targetSession?.bullets || [];
    } else {
      // Combine live bullets and history bullets
      allBullets = [
        ...liveBullets,
        ...sessions.flatMap(s => s.bullets)
      ];
    }
    allBullets = allBullets.slice(0, 50); // Limit to recent 50 bullets
    
    // Simulate AI quiz generation (will be replaced with actual API call)
    const mockQuestions: QuizQuestion[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      const bulletIndex = i % allBullets.length;
      const bullet = allBullets[bulletIndex];
      
      if (!bullet) continue;
      
      const questionTypes: Array<'mcq' | 'fill-blank' | 'short-answer'> = ['mcq', 'fill-blank', 'short-answer'];
      const type = questionTypes[i % 3];
      
      if (type === 'mcq') {
        mockQuestions.push({
          id: generateId(),
          type: 'mcq',
          question: `Based on the lecture, which statement is correct about: "${bullet.text.substring(0, 50)}..."?`,
          options: [
            bullet.text,
            'This is an incorrect option A',
            'This is an incorrect option B',
            'This is an incorrect option C'
          ],
          answer: bullet.text
        });
      } else if (type === 'fill-blank') {
        const words = bullet.text.split(' ');
        const blankIndex = Math.floor(words.length / 2);
        const answer = words[blankIndex];
        words[blankIndex] = '____';
        
        mockQuestions.push({
          id: generateId(),
          type: 'fill-blank',
          question: words.join(' '),
          answer
        });
      } else {
        mockQuestions.push({
          id: generateId(),
          type: 'short-answer',
          question: `Explain: ${bullet.text}`,
          answer: bullet.text
        });
      }
    }
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setQuizQuestions(mockQuestions);
    setIsGeneratingQuiz(false);
  }, [liveBullets, sessions, currentSession]);

  const addChatMessage = useCallback((content: string, role: 'user' | 'assistant', isAudio = false) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      isAudio
    };
    setChatMessages(prev => [...prev, message]);
    return message;
  }, []);

  const clearQuiz = useCallback(() => {
    setQuizQuestions([]);
  }, []);

  return {
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
  };
};
