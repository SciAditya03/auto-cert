import { NextResponse } from "next/server";
import { lookupCertificateEligibility } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registrationNumber = String(body.registrationNumber ?? "");

    if (!registrationNumber.trim()) {
      return NextResponse.json(
        { error: "Registration number is required." },
        { status: 400 }
      );
    }

    const result = await lookupCertificateEligibility(registrationNumber);

    if (!result.participant && result.achievements.length === 0) {
      return NextResponse.json(
        {
          found: false,
          message:
            "No eligible DBTHON certificate was found for this registration number."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ found: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the request." },
      { status: 500 }
    );
  }
}
