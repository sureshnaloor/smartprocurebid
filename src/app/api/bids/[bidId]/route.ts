import { NextRequest, NextResponse } from "next/server";
import { getBidById, updateBid, deleteBid } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
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

    // Only allow buyers to access their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ bid });
  } catch (error) {
    console.error("Failed to get bid:", error);
    return NextResponse.json(
      { error: "Failed to get bid" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Only allow buyers to update their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, dueDate, requirements, items } = body;

    const updatedBid = await updateBid(bidId, {
      title,
      description,
      dueDate,
      requirements,
      items,
    });

    return NextResponse.json({ bid: updatedBid });
  } catch (error) {
    console.error("Failed to update bid:", error);
    return NextResponse.json(
      { error: "Failed to update bid" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only allow buyers to delete their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await deleteBid(bidId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bid:", error);
    return NextResponse.json(
      { error: "Failed to delete bid" },
      { status: 500 }
    );
  }
}
