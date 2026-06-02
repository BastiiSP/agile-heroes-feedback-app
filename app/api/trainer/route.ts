import { NextResponse } from "next/server";
import { loadFeedback } from "@/lib/appsScript";

// POST /api/trainer  body: { password }
// Prüft das Passwort serverseitig und gibt bei Erfolg alle Feedbacks zurück.
// 401 bei falschem Passwort. Wird sowohl für Login als auch "Aktualisieren"
// verwendet (Client hält das Passwort im State und sendet es erneut).
export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password || "";
  } catch {
    password = "";
  }

  if (password !== process.env.TRAINER_PASSWORD) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  try {
    const feedback = await loadFeedback();
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json([]);
  }
}
