import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { parseCSV } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    // Convert the file to text
    const text = await file.text();
    
    // Parse CSV to get items
    const items = await parseCSV(text);

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No valid items found in the CSV file" },
        { status: 400 }
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to process CSV:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
