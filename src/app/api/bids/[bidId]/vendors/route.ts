import { NextRequest, NextResponse } from "next/server";
import { getBidById, addVendorsToBid } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sendBidInvitations } from "@/lib/email";

// Get vendors for a specific bid
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

    return NextResponse.json({ vendors: bid.invitedVendors });
  } catch (error) {
    console.error("Failed to get bid vendors:", error);
    return NextResponse.json(
      { error: "Failed to get bid vendors" },
      { status: 500 }
    );
  }
}

// Add vendors to an existing bid
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

    // Only allow buyers to add vendors to their own bids
    if (bid.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { vendors } = body;

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        { error: "At least one vendor is required" },
        { status: 400 }
      );
    }

    // Check if the bid is still active
    const currentDate = new Date();
    const dueDate = new Date(bid.dueDate);
    
    if (dueDate <= currentDate) {
      return NextResponse.json(
        { error: "Cannot add vendors to expired bids" },
        { status: 400 }
      );
    }

    // Convert vendor IDs to the required format
    const vendorsToAdd = vendors.map(vendor => ({
      vendorId: vendor.id,
      email: vendor.email,
      companyName: vendor.companyName,
      hasResponded: false,
    }));

    const updatedBid = await addVendorsToBid(bidId, vendorsToAdd);

    // Send invitation emails to the new vendors
    await sendBidInvitations(updatedBid, vendors);

    return NextResponse.json({ 
      success: true,
      bid: updatedBid
    });
  } catch (error) {
    console.error("Failed to add vendors to bid:", error);
    return NextResponse.json(
      { error: "Failed to add vendors to bid" },
      { status: 500 }
    );
  }
}
