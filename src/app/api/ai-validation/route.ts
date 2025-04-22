import { NextRequest, NextResponse } from "next/server";
import { validateBidItems, validateSubmission } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";

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
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    let validationResult;

    if (type === "bid_items") {
      validationResult = await validateBidItems(data);
    } else if (type === "vendor_submission") {
      validationResult = await validateSubmission(data);
    } else {
      return NextResponse.json(
        { error: "Invalid validation type" },
        { status: 400 }
      );
    }

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error("AI validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate data" },
      { status: 500 }
    );
  }
}
