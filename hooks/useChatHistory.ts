import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatHistory');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Convert string dates back to Date objects
        const sessionsWithDates = parsed.map((session) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setSessions(sessionsWithDates);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = useCallback((): ChatSession => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, []);

  const updateSession = useCallback((sessionId: string, messages: ChatMessage[]) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages,
          updatedAt: new Date(),
          title: messages.length > 0 ? messages[0].parts.slice(0, 50) + '...' : 'New Chat',
        };
      }
      return session;
    }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  }, []);

  const getSession = useCallback((sessionId: string): ChatSession | undefined => {
    return sessions.find(session => session.id === sessionId);
  }, [sessions]);

  return {
    sessions,
    createNewSession,
    updateSession,
    deleteSession,
    getSession,
  };
} 