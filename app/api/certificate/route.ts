import { NextResponse } from "next/server";
import { lookupCertificateEligibility } from "@/lib/data";
import { generateCertificatePdf } from "@/lib/certificate";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const registrationNumber = String(
      body.registrationNumber ?? ""
    ).trim().toUpperCase();

    const type = String(body.type ?? "")
      .trim()
      .toUpperCase();

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Registration number is required." },
        { status: 400 }
      );
    }

    if (type !== "PARTICIPATION" && type !== "ACHIEVEMENT") {
      return NextResponse.json(
        { error: "Invalid certificate type." },
        { status: 400 }
      );
    }

    // Verify that the student is actually eligible
    const result = await lookupCertificateEligibility(
      registrationNumber
    );

    if (type === "PARTICIPATION" && !result.participant) {
      return NextResponse.json(
        {
          error:
            "Participation certificate is not available for this registration number.",
        },
        { status: 403 }
      );
    }

    if (
      type === "ACHIEVEMENT" &&
      result.achievements.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Achievement certificate is not available for this registration number.",
        },
        { status: 403 }
      );
    }

    // The student's name comes from the database.
    // Achievement `name` is also the student's name.
    const studentName =
      result.participant?.name ??
      result.achievements[0]?.name ??
      "";

    if (!studentName.trim()) {
      return NextResponse.json(
        { error: "Student name could not be found." },
        { status: 500 }
      );
    }

    /*
     * Generate the PDF first.
     *
     * We only record the download after successful PDF generation.
     * This prevents a failed PDF generation from consuming one
     * of the student's two allowed downloads.
     */
    const pdfBytes = await generateCertificatePdf(
      type,
      studentName
    );

    /*
     * Atomically check the download count and record this download.
     *
     * The limit is PER CERTIFICATE TYPE:
     *
     * PARTICIPATION -> maximum 2
     * ACHIEVEMENT   -> maximum 2
     */
    const { data: allowed, error: logError } =
      await supabase.rpc("record_certificate_download", {
        p_registration_number: registrationNumber,
        p_certificate_type: type,
      });

    if (logError) {
      console.error(
        "Certificate download log error:",
        logError
      );

      return NextResponse.json(
        { error: "Unable to process certificate download." },
        { status: 500 }
      );
    }

    if (!allowed) {
      const certificateLabel =
        type === "PARTICIPATION"
          ? "participation"
          : "achievement";

      return NextResponse.json(
        {
          error: `You have already downloaded your ${certificateLabel} certificate 2 times. Each certificate can be downloaded up to 2 times.`,
        },
        { status: 429 }
      );
    }

    const safeName = studentName
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const filename = `DBTHON_2026_${type}_${safeName}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);

    return NextResponse.json(
      { error: "Certificate generation failed." },
      { status: 500 }
    );
  }
}