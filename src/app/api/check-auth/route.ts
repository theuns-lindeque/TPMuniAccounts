import { getMe } from "@/app/(main)/actions/users";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getMe();
    return NextResponse.json({
      authenticated: !!user,
      user: user ? { email: user.email, role: user.role } : null,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
