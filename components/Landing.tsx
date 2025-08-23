"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Landing() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="w-10 h-10 border-2 border-gray-600 flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-400"></div>
        </div>
        
        {/* Contact Button */}
        <button className="bg-gray-800 text-gray-200 px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors">
          Contact Us
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Chat
            <span className="text-gray-400">History</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
            A fast, intuitive platform where users can store, search, and analyze their chat conversations with powerful AI capabilities in real-time.
          </p>
          
          {/* Get Started Button */}
          <Link href="/signin">
            <button className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 mx-auto hover:bg-gray-700 transition-colors transform hover:scale-105">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-gray-500 text-sm">
          © 2024 ChatHistory. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
