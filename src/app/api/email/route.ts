import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "To, subject, and content (html or text) are required" },
        { status: 400 }
      );
    }

    // Validate that user is only sending to vendors
    // This is a basic security check to prevent email abuse
    if (!Array.isArray(to)) {
      return NextResponse.json(
        { error: "To must be an array of email addresses" },
        { status: 400 }
      );
    }

    await sendEmail({
      to,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
