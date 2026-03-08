import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-session";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({
      user: { id: session.id, email: session.email, name: session.name },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
