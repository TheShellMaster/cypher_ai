import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PptxGenJS from 'pptxgenjs';

export interface PDFSection {
  title?: string;
  content: string;
}

export interface PDFDocumentOptions {
  title: string;
  author?: string;
  subject?: string;
  sections: PDFSection[];
}

export interface PPTXSlide {
  title: string;
  points: string[];
  notes?: string;
}

export interface PPTXPresentationOptions {
  title: string;
  subtitle?: string;
  author?: string;
  slides: PPTXSlide[];
}

/**
 * Generate a clean, executive-ready PDF document
 */
export async function generatePDF(options: PDFDocumentOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let cursorY = height - margin;

  // Header Bar
  page.drawRectangle({
    x: margin,
    y: cursorY - 4,
    width: width - margin * 2,
    height: 3,
    color: rgb(0.09, 0.09, 0.11), // #18181b
  });
  cursorY -= 30;

  // Document Title
  page.drawText(options.title, {
    x: margin,
    y: cursorY,
    size: 22,
    font: fontBold,
    color: rgb(0.09, 0.09, 0.11),
  });
  cursorY -= 20;

  // Metadata / Date
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  page.drawText(`Cypher AI · Document de Synthèse · ${dateStr}`, {
    x: margin,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.5),
  });
  cursorY -= 40;

  // Helper for word wrapping
  function drawWrappedText(text: string, fontSize = 10, isBold = false, indent = 0) {
    const font = isBold ? fontBold : fontRegular;
    const maxWidth = width - margin * 2 - indent;
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && currentLine) {
        if (cursorY < margin + 40) {
          page = pdfDoc.addPage([595.28, 841.89]);
          cursorY = height - margin - 20;
        }
        page.drawText(currentLine, {
          x: margin + indent,
          y: cursorY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.18),
        });
        cursorY -= fontSize * 1.5;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (cursorY < margin + 40) {
        page = pdfDoc.addPage([595.28, 841.89]);
        cursorY = height - margin - 20;
      }
      page.drawText(currentLine, {
        x: margin + indent,
        y: cursorY,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.18),
      });
      cursorY -= fontSize * 1.5;
    }
  }

  // Draw Sections
  for (const section of options.sections) {
    if (section.title) {
      cursorY -= 15;
      if (cursorY < margin + 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        cursorY = height - margin - 20;
      }
      page.drawText(section.title, {
        x: margin,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: rgb(0.1, 0.12, 0.18),
      });
      cursorY -= 18;
    }

    const paragraphs = section.content.split('\n').filter((p) => p.trim());
    for (const para of paragraphs) {
      drawWrappedText(para.trim(), 10, false, 0);
      cursorY -= 8;
    }
    cursorY -= 10;
  }

  // Footer on all pages
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawText(`Page ${i + 1} / ${pages.length} · Cypher AI Engine`, {
      x: margin,
      y: margin - 20,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.65),
    });
  }

  return await pdfDoc.save();
}

/**
 * Generate a modern, executive PowerPoint presentation
 */
export async function generatePPTX(options: PPTXPresentationOptions): Promise<ArrayBuffer> {
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = options.author || 'Cypher AI';
  pptx.title = options.title;

  // 1. Cover Slide (Minimalist Dark Theme)
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '09090b' };

  coverSlide.addText(options.title, {
    x: 1.0,
    y: 2.2,
    w: '85%',
    h: 1.5,
    fontSize: 38,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
  });

  if (options.subtitle) {
    coverSlide.addText(options.subtitle, {
      x: 1.0,
      y: 3.7,
      w: '80%',
      h: 0.8,
      fontSize: 18,
      color: 'A1A1AA',
      fontFace: 'Arial',
    });
  }

  coverSlide.addText(`Cypher AI · Présentation Structurée`, {
    x: 1.0,
    y: 6.2,
    fontSize: 11,
    color: '71717A',
    fontFace: 'Arial',
  });

  // 2. Content Slides
  for (const slideData of options.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Header Accent Line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 0.6,
      w: 0.2,
      h: 0.6,
      fill: { color: '18181B' },
      line: { color: '18181B' },
    });

    // Slide Title
    slide.addText(slideData.title, {
      x: 1.2,
      y: 0.6,
      w: '80%',
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: '18181B',
      fontFace: 'Arial',
    });

    // Slide Bullet Points
    const bulletItems = slideData.points.map((p) => ({
      text: p,
      options: {
        fontSize: 14,
        color: '3F3F46',
        bullet: true,
        breakLine: true,
        fontFace: 'Arial',
      },
    }));

    slide.addText(bulletItems as any, {
      x: 1.0,
      y: 1.8,
      w: '85%',
      h: 4.5,
      lineSpacing: 26,
    });

    // Slide Footer
    slide.addText(`Cypher AI`, {
      x: 1.0,
      y: 6.8,
      fontSize: 9,
      color: 'A1A1AA',
      fontFace: 'Arial',
    });
  }

  return (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
}
