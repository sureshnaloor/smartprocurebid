import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, companyName } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    const result = await register(email, password, name, role, companyName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Registration failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
