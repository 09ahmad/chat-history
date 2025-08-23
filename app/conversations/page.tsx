"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useDatabaseChat } from "@/hooks/useDatabaseChat";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Conversations() {
  const { data: session } = useSession();
  const { conversations, deleteConversation, isLoading } = useDatabaseChat();
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
            <Button onClick={() => router.push("/chat")}>
              New Conversation
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500 mb-4">Start your first conversation to see it here</p>
              <Button onClick={() => router.push("/chat")}>Start Chatting</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link href={`/chat?session=${conversation.id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {conversation.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {conversation.messages.length} messages • {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => router.push(`/chat?session=${conversation.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={() => deleteConversation(conversation.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 