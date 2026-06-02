import { NextResponse } from "next/server";
import { getTrainers } from "@/lib/appsScript";

// GET /api/trainers  →  string[] (alle Trainernamen, modul-unabhängig)
export async function GET() {
  try {
    const trainers = await getTrainers();
    return NextResponse.json(trainers);
  } catch {
    // Wie im Original: bei Fehler leere Liste.
    return NextResponse.json([]);
  }
}
