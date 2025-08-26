import { Request } from "express";
import { client } from "@/db/src/index";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field" },
        { status: 400 }
      );
    }
    const conversations = await client.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
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
