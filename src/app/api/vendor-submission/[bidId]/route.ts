import { NextRequest, NextResponse } from "next/server";
import { getBidByIdForVendor, submitVendorResponse } from "@/lib/db";
import { validateSubmission } from "@/lib/ai";
import { sendSubmissionNotification } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { bidId } = params;
    const url = new URL(req.url);
    const vendorId = url.searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const bid = await getBidByIdForVendor(bidId, vendorId);
    
    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found or you don't have access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ bid });
  } catch (error) {
    console.error("Failed to get bid for vendor:", error);
    return NextResponse.json(
      { error: "Failed to get bid details" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { bidId } = params;
    const url = new URL(req.url);
    const vendorId = url.searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const bid = await getBidByIdForVendor(bidId, vendorId);
    
    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found or you don't have access" },
        { status: 404 }
      );
    }

    // Check if the bid is still active
    const currentDate = new Date();
    const dueDate = new Date(bid.dueDate);
    
    if (dueDate <= currentDate) {
      return NextResponse.json(
        { error: "This bid has expired and is no longer accepting responses" },
        { status: 400 }
      );
    }

    // Check if the vendor has already responded
    const vendor = bid.invitedVendors.find(v => v.vendorId === vendorId);
    if (vendor?.hasResponded) {
      return NextResponse.json(
        { error: "You have already submitted a response to this bid" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const submission = body.submission;

    if (!submission || !submission.items || submission.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid submission data" },
        { status: 400 }
      );
    }

    // Validate submission with AI
    const validationResult = await validateSubmission(submission);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: `Validation error: ${validationResult.message}` },
        { status: 400 }
      );
    }

    const updatedBid = await submitVendorResponse(bidId, vendorId, submission);

    // Notify buyer about the submission
    await sendSubmissionNotification(updatedBid, vendorId);

    return NextResponse.json({ 
      success: true,
      message: "Your response has been submitted successfully"
    });
  } catch (error) {
    console.error("Failed to submit vendor response:", error);
    return NextResponse.json(
      { error: "Failed to submit your response" },
      { status: 500 }
    );
  }
}
