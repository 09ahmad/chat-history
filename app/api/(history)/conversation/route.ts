import { client } from "@/db/src";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();
    if (!userId) {
      return NextResponse.json({ erro: "UserId is required" }, { status: 400 });
    }
    const conversations = await client.conversation.create({
      data: {
        userId,
        title: title || "New Conversation",
      },
      include: {
        messages: true,
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
