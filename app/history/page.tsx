"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useDatabaseChat } from "@/hooks/useDatabaseChat";
import { useRouter } from "next/navigation";

export default function History() {
  const { data: session } = useSession();
  const { conversations, isLoading } = useDatabaseChat();
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
            <Button variant="outline">Export Data</Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
              <p className="text-gray-500 mb-4">Your chat history will appear here once you start conversations</p>
              <Button onClick={() => router.push("/chat")}>Start Your First Chat</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{conversations.length}</h3>
                  <p className="text-gray-600">Total Conversations</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{totalMessages}</h3>
                  <p className="text-gray-600">Total Messages</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversations.length > 0 ? formatDate(conversations[0].createdAt) : 'N/A'}
                  </h3>
                  <p className="text-gray-600">First Conversation</p>
                </div>
              </div>

              {/* Conversations List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {conversation.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {conversation.messages.length} messages • Created {formatDate(conversation.createdAt)}
                        </p>
                        {conversation.messages.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {conversation.messages[0].content.slice(0, 100)}...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => router.push(`/chat?session=${conversation.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 