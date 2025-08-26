import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { client } from "@/db/src";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, history } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create user
    let user = await client.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      user = await client.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null
        }
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await client.conversation.findUnique({
        where: { id: conversationId, userId: user.id }
      });
    }

    if (!conversation) {
      conversation = await client.conversation.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50) + "..."
        }
      });
    }

    // Save user message to database
    const _userMessage = await client.messages.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message
      }
    });

    // Create a new chat session
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Format history to match Gemini's expected structure
    const formattedHistory = history?.map((msg) => ({
      role: msg.role, // should be 'user' or 'model'
      parts: [{ text: msg.content || msg.text || msg.parts?.[0]?.text }]
    })) || [];

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Save AI response to database
    const _aiMessage = await client.messages.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: text
      }
    });

    if (conversation.title === "New Conversation") {
      await client.conversation.update({
        where: { id: conversation.id },
        data: { title: message.slice(0, 50) + "..." }
      });
    }

    return NextResponse.json({
      response: text,
      conversationId: conversation.id,
      history: await chat.getHistory()
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Gemini" },
      { status: 500 }
    );
  }
}