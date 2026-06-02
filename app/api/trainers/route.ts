import { NextResponse } from "next/server";
import { getTrainers } from "@/lib/appsScript";

// GET /api/trainers?modul=PM  →  string[] (Trainernamen)
export async function GET(request: Request) {
  const modul = new URL(request.url).searchParams.get("modul") || "";
  try {
    const trainers = await getTrainers(modul);
    return NextResponse.json(trainers);
  } catch {
    // Wie im Original: bei Fehler leere Liste.
    return NextResponse.json([]);
  }
}
