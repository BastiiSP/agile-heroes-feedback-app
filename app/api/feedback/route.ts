import { NextResponse } from "next/server";
import { submitFeedback } from "@/lib/appsScript";
import type { FeedbackEntry } from "@/lib/types";

// POST /api/feedback  —  Feedback einreichen.
export async function POST(request: Request) {
  try {
    const entry = (await request.json()) as FeedbackEntry;
    await submitFeedback(entry);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
