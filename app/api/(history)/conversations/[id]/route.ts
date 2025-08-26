import { client } from "@/db/src";
import { NextRequest, NextResponse } from "next/server";

interface ParamsType{
  params: Promise<{ id: string }> 
}

export async function DELETE(
  _: NextRequest,
   { params }: ParamsType
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const conversation = await client.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    await client.messages.deleteMany({
      where: { conversationId: id },
    });

    await client.conversation.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
