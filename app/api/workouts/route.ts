import { NextRequest, NextResponse } from "next/server";

// In-memory store for now — replace with Prisma + PostgreSQL later
const workouts: Record<string, unknown>[] = [];

export async function GET() {
  return NextResponse.json({ workouts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const workout = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...body,
  };
  workouts.push(workout);
  return NextResponse.json({ workout }, { status: 201 });
}
