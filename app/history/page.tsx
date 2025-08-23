"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function History() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
            <Button variant="outline">Export Data</Button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
            <p className="text-gray-500 mb-4">Your chat history will appear here once you start conversations</p>
            <Button>Start Your First Chat</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 