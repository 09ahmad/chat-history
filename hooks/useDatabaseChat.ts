import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface DatabaseMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface DatabaseConversation {
  id: string;
  userId: string;
  title: string;
  messages: DatabaseMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export function useDatabaseChat() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<DatabaseConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<DatabaseConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Fetch a specific conversation
  const fetchConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/history/messages/${conversationId}`);
      if (response.ok) {
        const messages = await response.json();
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          const updatedConversation = { ...conversation, messages };
          setCurrentConversation(updatedConversation);
          return updatedConversation;
        }
      } else {
        console.error('Failed to fetch conversation messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
    return null;
  }, [conversations]);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string) => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch('/api/history/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.email,
          title: title || 'New Conversation'
        })
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        return newConversation;
      } else {
        console.error('Failed to create conversation:', response.status);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  }, [session?.user?.email]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/history/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
        return true;
      } else {
        console.error('Failed to delete conversation:', response.status);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
    return false;
  }, [currentConversation?.id]);

  // Send a message and get AI response
  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          history: currentConversation?.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })) || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh conversations list to get updated data
        await fetchConversations();

        return data;
      } else {
        console.error('Failed to send message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    return null;
  }, [session?.user?.email, currentConversation?.messages, fetchConversations]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    currentConversation,
    isLoading,
    fetchConversations,
    fetchConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    setCurrentConversation
  };
} 