import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Quotation email dispatch has been permanently disabled." },
    { status: 410 }
  );
}
