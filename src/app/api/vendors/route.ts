import { NextRequest, NextResponse } from "next/server";
import { getVendors, addVendor } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendors = await getVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Failed to get vendors:", error);
    return NextResponse.json(
      { error: "Failed to get vendors" },
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
    const { companyName, email, contactName, phone, tier, location, materialClasses } = body;

    if (!companyName || !email) {
      return NextResponse.json(
        { error: "Company name and email are required" },
        { status: 400 }
      );
    }

    const vendor = await addVendor({
      buyerId: user.id,
      companyName,
      email,
      contactName,
      phone,
      tier,
      location,
      materialClasses,
    });

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Failed to add vendor:", error);
    return NextResponse.json(
      { error: "Failed to add vendor" },
      { status: 500 }
    );
  }
}
