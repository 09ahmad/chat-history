import { GoogleGenerativeAI } from "@google/generative-ai";

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db/src";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create user
    let user = await client.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await client.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        },
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await client.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!conversation) {
      conversation = await client.conversation.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50) + "...",
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    // Store user message
    const userMessage = await client.messages.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Prepare conversation history for Gemini
    const history = conversation.messages.map(msg => ({
      role: msg.role as "user" | "model",
      parts: msg.content,
    }));

    // Create a new chat session with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Store AI response
    const aiMessage = await client.messages.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0) {
      await client.conversation.update({
        where: { id: conversation.id },
        data: { title: message.slice(0, 50) + "..." },
      });
    }

    return NextResponse.json({ 
      response: aiResponse,
      conversationId: conversation.id,
      messageId: aiMessage.id
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Gemini" },
      { status: 500 }
    );
  }
}