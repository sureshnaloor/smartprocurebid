import { NextRequest, NextResponse } from "next/server";
import { getBidById, sendReminders } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

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

    // Only allow buyers to send reminders for their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the bid is still active
    const currentDate = new Date();
    const dueDate = new Date(bid.dueDate);
    
    if (dueDate <= currentDate) {
      return NextResponse.json(
        { error: "Cannot send reminders for expired bids" },
        { status: 400 }
      );
    }

    // Get vendors who haven't responded
    const pendingVendors = bid.invitedVendors.filter(v => !v.hasResponded);
    
    if (pendingVendors.length === 0) {
      return NextResponse.json(
        { error: "All vendors have already responded" },
        { status: 400 }
      );
    }

    await sendReminders(bidId);

    return NextResponse.json({ 
      success: true,
      message: `Reminders sent to ${pendingVendors.length} vendors` 
    });
  } catch (error) {
    console.error("Failed to send reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
