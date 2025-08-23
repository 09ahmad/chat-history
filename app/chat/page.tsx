"use client";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";

export default function Chat() {
  const { data: session } = useSession();

  return <ChatInterface />;
} 