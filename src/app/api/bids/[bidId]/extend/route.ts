import { NextRequest, NextResponse } from "next/server";
import { getBidById, extendBidDueDate } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sendBidExtensionNotifications } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { bidId } = params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bid = await getBidById(bidId);
    
    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    // Only allow buyers to extend due dates for their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { dueDate } = body;

    if (!dueDate) {
      return NextResponse.json(
        { error: "New due date is required" },
        { status: 400 }
      );
    }

    const newDueDate = new Date(dueDate);
    const currentDate = new Date();
    
    if (newDueDate <= currentDate) {
      return NextResponse.json(
        { error: "New due date must be in the future" },
        { status: 400 }
      );
    }

    const updatedBid = await extendBidDueDate(bidId, newDueDate);

    // Notify vendors about the extended due date
    await sendBidExtensionNotifications(updatedBid);

    return NextResponse.json({ bid: updatedBid });
  } catch (error) {
    console.error("Failed to extend due date:", error);
    return NextResponse.json(
      { error: "Failed to extend due date" },
      { status: 500 }
    );
  }
}
