import { client } from "@/db/src/index";
import { NextRequest, NextResponse } from "next/server";

interface ParamsType{
  params: Promise<{ id: string }> 
}

// POST: Add a message to the conversation
export async function POST(
  request: NextRequest,
  { params }: ParamsType
) {
  const conversationId = (await params).id;
  const { role, content } = await request.json();

  if (!conversationId || !role || !content) {
    return NextResponse.json(
      { error: "Required fields are missing" },
      { status: 400 }
    );
  }

  const conversation = await client.conversation.findFirst({
    where: {
      id: conversationId,
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const message = await client.messages.create({
    data: {
      conversationId,
      role,
      content,
    },
  });

  return NextResponse.json(message, { status: 201 });
}

// GET: Get all messages for the conversation
export async function GET(
  request: NextRequest,
  { params }: { params:Promise<{ id: string }> }
) {
  const conversationId = (await params).id;

  const messages = await client.messages.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(messages, { status: 200 });
}

// DELETE: Delete all messages for the conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  const conversationId = (await params).id;

  const deletedMessages = await client.messages.deleteMany({
    where: {
      conversationId,
    },
  });

  return NextResponse.json(
    { message: `${deletedMessages.count} messages deleted` },
    { status: 200 }
  );
}
