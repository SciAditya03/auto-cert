import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const PAGE_WIDTH = 841.89; // A4 landscape
const PAGE_HEIGHT = 595.28;

function fitFontSize(
  text: string,
  font: any,
  maxWidth: number,
  startSize: number,
  minSize: number
) {
  let size = startSize;

  while (
    size > minSize &&
    font.widthOfTextAtSize(text, size) > maxWidth
  ) {
    size -= 1;
  }

  return size;
}

export async function generateCertificatePdf(
  type: "PARTICIPATION" | "ACHIEVEMENT",
  studentName: string
) {
  // ---------------------------------------------
  // SELECT TEMPLATE
  // ---------------------------------------------

  const templateName =
    type === "ACHIEVEMENT"
      ? "achievement.png"
      : "participation.png";

  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    templateName
  );

  const templateBytes = await fs.readFile(templatePath);

  // ---------------------------------------------
  // CREATE PDF
  // ---------------------------------------------

  const pdf = await PDFDocument.create();

  pdf.registerFontkit(fontkit);

  const page = pdf.addPage([
    PAGE_WIDTH,
    PAGE_HEIGHT,
  ]);

  // ---------------------------------------------
  // ADD CERTIFICATE BACKGROUND
  // ---------------------------------------------

  const image = await pdf.embedPng(
    templateBytes
  );

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  });

  // ---------------------------------------------
  // COORDINATE SCALING
  // ---------------------------------------------

  const scaleX =
    PAGE_WIDTH /
    (type === "ACHIEVEMENT" ? 822 : 807);

  const scaleY =
    PAGE_HEIGHT /
    (type === "ACHIEVEMENT" ? 555 : 537);

  const toX = (x: number) =>
    x * scaleX;

  const toY = (y: number) =>
    PAGE_HEIGHT - y * scaleY;

  // ---------------------------------------------
  // COLORS
  // ---------------------------------------------

  const navy = rgb(
    0.035,
    0.08,
    0.28
  );

  // ---------------------------------------------
  // NAME FONT
  // ---------------------------------------------

  const nameFont =
    await pdf.embedFont(
      StandardFonts.TimesRoman
    );

  // ---------------------------------------------
  // STUDENT NAME
  // ---------------------------------------------

  const cleanStudentName =
    studentName.trim().toUpperCase();

  if (!cleanStudentName) {
    throw new Error(
      "Student name is required."
    );
  }

  // Maximum width of the name area.
  //
  // Achievement:
  // centered between the existing gold lines.
  //
  // Participation:
  // centered in the blank name area.
  const maxNameWidth =
    type === "ACHIEVEMENT"
      ? 380
      : 430;

  const nameSize =
    fitFontSize(
      cleanStudentName,
      nameFont,
      maxNameWidth,
      30,
      17
    );

  const nameWidth =
    nameFont.widthOfTextAtSize(
      cleanStudentName,
      nameSize
    );

  // ---------------------------------------------
  // NAME POSITION
  // ---------------------------------------------

  const nameY =
    type === "ACHIEVEMENT"
      ? 245
      : 247;

  page.drawText(
    cleanStudentName,
    {
      x:
        (PAGE_WIDTH - nameWidth) / 2,

      y:
        toY(nameY),

      size: nameSize,

      font: nameFont,

      color: navy,
    }
  );

  // ---------------------------------------------
  // RETURN PDF
  // ---------------------------------------------

  return pdf.save();
}