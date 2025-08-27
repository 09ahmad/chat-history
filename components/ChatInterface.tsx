"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDatabaseChat, DatabaseMessage } from "@/hooks/useDatabaseChat";

export default function ChatInterface() {
  const { 
    currentConversation, 
    sendMessage, 
    createConversation, 
    fetchConversation,
    setCurrentConversation,
    conversations 
  } = useDatabaseChat();
  
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation from URL or create new one
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('session');
    
    console.log('Available conversations:', conversations.length);
    
    if (conversationId) {
      fetchConversation(conversationId).then(conversation => {
        if (conversation) {
          setMessages(conversation.messages);
          setCurrentConversation(conversation);
        }
      });
    } else {
      // Create new conversation
      createConversation().then(conversation => {
        if (conversation) {
          setCurrentConversation(conversation);
          setMessages([]);
        }
      });
    }
  }, [fetchConversation, createConversation, setCurrentConversation, conversations.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: DatabaseMessage = {
      id: Date.now().toString(),
      conversationId: currentConversation?.id || '',
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(input.trim(), currentConversation?.id);
      
      if (response) {
        const aiMessage: DatabaseMessage = {
          id: Date.now().toString() + 'ai',
          conversationId: currentConversation?.id || '',
          role: "assistant",
          content: response.response,
          createdAt: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: DatabaseMessage = {
        id: Date.now().toString() + 'error',
        conversationId: currentConversation?.id || '',
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = async () => {
    const newConversation = await createConversation();
    if (newConversation) {
      setCurrentConversation(newConversation);
      setMessages([]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 w-full">
      {/* Header */}
      <div className="border-b border-gray-700 px-6 py-4 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-300 font-bold text-sm">G</span>
            </div>
            <h1 className="text-xl font-semibold text-white">Gemini Chat</h1>
          </div>
          <Button
            onClick={clearChat}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-600 hover:bg-gray-700"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-300 font-bold text-xl">G</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              I&apos;m Gemini, an AI assistant. Ask me anything - I can help with writing, 
              analysis, coding, and much more.
            </p>
          </div>
        )}

        {messages.map((message, _) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-300 font-bold text-sm">G</span>
              </div>
            )}
            
            <div
              className={`max-w-3xl rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {formatTime(message.createdAt)}
              </div>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-300 font-bold text-sm">U</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-300 font-bold text-sm">G</span>
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-gray-400 text-sm">Gemini is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 px-6 py-4 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="w-full resize-none border border-gray-600 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              rows={1}
              style={{
                minHeight: "48px",
                maxHeight: "200px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 200) + "px";
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
        
        <div className="text-xs text-gray-400 mt-2 text-center">
          Gemini can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
} 