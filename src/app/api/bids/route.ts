import { NextRequest, NextResponse } from "next/server";
import { getBids, createBid } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sendBidInvitations } from "@/lib/email";
import { validateBidItems } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bids = await getBids(user.id);
    return NextResponse.json({ bids });
  } catch (error) {
    console.error("Failed to get bids:", error);
    return NextResponse.json(
      { error: "Failed to get bids" },
      { status: 500 }
    );
  }
}

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
    const { title, description, dueDate, requirements, items, invitedVendors } = body;

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { error: "Title, description, and due date are required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Bid must contain at least one item" },
        { status: 400 }
      );
    }

    if (!invitedVendors || invitedVendors.length === 0) {
      return NextResponse.json(
        { error: "At least one vendor must be invited" },
        { status: 400 }
      );
    }

    // Validate bid items with AI
    const validationResult = await validateBidItems(items);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: `AI validation failed: ${validationResult.message}` },
        { status: 400 }
      );
    }

    const bid = await createBid({
      buyerId: user.id,
      title,
      description,
      dueDate,
      requirements,
      items,
      invitedVendors,
    });

    // Send invitation emails to vendors
    await sendBidInvitations(bid, invitedVendors);

    return NextResponse.json({ bid });
  } catch (error) {
    console.error("Failed to create bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
