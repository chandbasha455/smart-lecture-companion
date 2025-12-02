import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BulletPoint } from '@/types/lecture';

interface UseChatAssistantProps {
  liveBullets: BulletPoint[];
}

export const useChatAssistant = ({ liveBullets }: UseChatAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const askQuestion = useCallback(async (question: string): Promise<string> => {
    setIsProcessing(true);
    
    try {
      const context = liveBullets.map(b => b.text);
      
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { question, context }
      });

      if (error) {
        console.error('Chat assistant error:', error);
        return "Sorry, I couldn't process your question. Please try again.";
      }

      return data.answer || "I couldn't generate a response.";
    } catch (err) {
      console.error('Chat error:', err);
      return "An error occurred. Please try again.";
    } finally {
      setIsProcessing(false);
    }
  }, [liveBullets]);

  return {
    askQuestion,
    isProcessing
  };
};
