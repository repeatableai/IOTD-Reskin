/**
 * IC Memo Export Service
 * Generates DOCX and PDF exports of Investment Committee Memoranda
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Footer,
  Header,
  ImageRun,
} from "docx";
// @ts-ignore - pdfkit default export
import PDFDocument from "pdfkit";

// Types for IC Memo data
interface ICMemoSection {
  id: string;
  title: string;
  content: string;
  confidenceTags: {
    verified: number;
    estimated: number;
    unverified: number;
  };
}

interface Expert {
  name: string;
  credentials: string;
  framework: string;
  rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
  analysis: string;
}

interface DiligenceItem {
  category: 'gating' | 'pre_close' | 'supplementary';
  item: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ICMemoExportData {
  disclaimer?: string;
  sections: ICMemoSection[];
  recommendation: {
    verdict: 'INVEST' | 'CONDITIONAL' | 'MORE_DATA' | 'PASS';
    confidence: number;
    conditions?: string[];
    summary: string;
  };
  expertPanel: Expert[];
  diligenceItems: DiligenceItem[];
  confidenceStats: {
    verified: number;
    estimated: number;
    unverified: number;
  };
  tier: 1 | 2 | 3;
  tierLabel: string;
  ideaId: string;
  ideaTitle: string;
  completenessScore: number;
  populatedFields: string[];
  missingFields: string[];
}

// Helper to strip Markdown and confidence tags for plain text
function stripMarkdown(text: string): string {
  return text
    // Remove confidence tags
    .replace(/\[VERIFIED\]/g, '[V]')
    .replace(/\[ESTIMATED\]/g, '[E]')
    .replace(/\[UNVERIFIED\]/g, '[U]')
    // Remove markdown formatting
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .trim();
}

// Parse markdown content into structured elements for DOCX
function parseMarkdownToParagraphs(content: string): Array<{ type: 'heading' | 'paragraph' | 'bullet' | 'table'; text: string; level?: number }> {
  const lines = content.split('\n');
  const elements: Array<{ type: 'heading' | 'paragraph' | 'bullet' | 'table'; text: string; level?: number }> = [];
  let currentParagraph = '';
  let inTable = false;
  let tableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentParagraph) {
        elements.push({ type: 'paragraph', text: currentParagraph.trim() });
        currentParagraph = '';
      }
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      // End of table
      elements.push({ type: 'table', text: tableLines.join('\n') });
      tableLines = [];
      inTable = false;
    }

    // Check for heading
    if (trimmed.startsWith('###')) {
      if (currentParagraph) {
        elements.push({ type: 'paragraph', text: currentParagraph.trim() });
        currentParagraph = '';
      }
      elements.push({ type: 'heading', text: trimmed.replace(/^#{1,6}\s*/, ''), level: 3 });
      continue;
    }

    // Check for bullet
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      if (currentParagraph) {
        elements.push({ type: 'paragraph', text: currentParagraph.trim() });
        currentParagraph = '';
      }
      elements.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '') });
      continue;
    }

    // Empty line = paragraph break
    if (!trimmed) {
      if (currentParagraph) {
        elements.push({ type: 'paragraph', text: currentParagraph.trim() });
        currentParagraph = '';
      }
      continue;
    }

    // Regular text
    currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
  }

  // Don't forget remaining content
  if (inTable && tableLines.length > 0) {
    elements.push({ type: 'table', text: tableLines.join('\n') });
  }
  if (currentParagraph) {
    elements.push({ type: 'paragraph', text: currentParagraph.trim() });
  }

  return elements;
}

// Create TextRuns with formatting for bold and confidence tags
function createFormattedTextRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];

  // Split by bold markers and confidence tags
  const parts = text.split(/(\*\*[^*]+\*\*|\[V\]|\[E\]|\[U\])/g);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part === '[V]') {
      runs.push(new TextRun({ text: ' [V] ', color: '16a34a', bold: true, size: 18 }));
    } else if (part === '[E]') {
      runs.push(new TextRun({ text: ' [E] ', color: 'd97706', bold: true, size: 18 }));
    } else if (part === '[U]') {
      runs.push(new TextRun({ text: ' [U] ', color: 'dc2626', bold: true, size: 18 }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  }

  return runs;
}

/**
 * Generate DOCX document from IC Memo data
 */
export async function generateICMemoDocx(data: ICMemoExportData): Promise<Buffer> {
  const tierLabels = {
    1: 'Thesis Assessment',
    2: 'Preliminary Memo',
    3: 'Full IC Memorandum',
  };

  const verdictColors: Record<string, string> = {
    INVEST: '16a34a',
    CONDITIONAL: 'd97706',
    MORE_DATA: '2563eb',
    PASS: 'dc2626',
  };

  const children: any[] = [];

  // Title Page
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'INVESTMENT COMMITTEE',
          bold: true,
          size: 48,
          color: '1B2A4A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'MEMORANDUM',
          bold: true,
          size: 48,
          color: '1B2A4A',
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.ideaTitle,
          bold: true,
          size: 36,
          color: 'C5985E',
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Tier ${data.tier}: ${tierLabels[data.tier]}`,
          size: 28,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Data Completeness: ${data.completenessScore}%`,
          size: 24,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          size: 20,
          color: '999999',
          italics: true,
        }),
      ],
    }),
  );

  // Page break after title
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Disclaimer
  if (data.disclaimer) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'DISCLAIMER',
            bold: true,
            color: '1B2A4A',
          }),
        ],
      }),
      new Paragraph({
        shading: { fill: 'FEF3C7' },
        border: {
          left: { style: BorderStyle.SINGLE, size: 24, color: 'F59E0B' },
        },
        children: [
          new TextRun({
            text: data.disclaimer,
            italics: true,
            size: 22,
          }),
        ],
      }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
    );
  }

  // Confidence Statistics Table
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: 'CONFIDENCE SUMMARY',
          bold: true,
          color: '1B2A4A',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Count', bold: true })] })],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })],
              shading: { fill: 'F3F4F6' },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Verified [V]', color: '16a34a', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(data.confidenceStats.verified) })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Directly from provided data or cited sources' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Estimated [E]', color: 'd97706', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(data.confidenceStats.estimated) })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Calculated from benchmarks or comparable data' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Unverified [U]', color: 'dc2626', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(data.confidenceStats.unverified) })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Requires additional diligence to confirm' })] })],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  );

  // Memo Sections
  for (const section of data.sections) {
    // Section header
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            color: '1B2A4A',
            size: 28,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Confidence: `, size: 18, color: '666666' }),
          new TextRun({ text: `${section.confidenceTags.verified}V `, size: 18, color: '16a34a', bold: true }),
          new TextRun({ text: `${section.confidenceTags.estimated}E `, size: 18, color: 'd97706', bold: true }),
          new TextRun({ text: `${section.confidenceTags.unverified}U`, size: 18, color: 'dc2626', bold: true }),
        ],
      }),
    );

    // Parse and add section content
    const strippedContent = stripMarkdown(section.content);
    const elements = parseMarkdownToParagraphs(section.content);

    for (const element of elements) {
      if (element.type === 'heading') {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: stripMarkdown(element.text),
                bold: true,
                color: '1B2A4A',
                size: 24,
              }),
            ],
          })
        );
      } else if (element.type === 'bullet') {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: createFormattedTextRuns(stripMarkdown(element.text)),
          })
        );
      } else if (element.type === 'paragraph') {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: createFormattedTextRuns(stripMarkdown(element.text)),
          })
        );
      }
    }
  }

  // Expert Panel Section
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'EXPERT PANEL ASSESSMENT',
          bold: true,
          color: '1B2A4A',
          size: 28,
        }),
      ],
    }),
  );

  for (const expert of data.expertPanel) {
    const ratingColor = {
      STRONG_INVEST: '16a34a',
      INVEST: '22c55e',
      CONDITIONAL: 'd97706',
      CAUTIOUS: 'ea580c',
      PASS: 'dc2626',
    }[expert.rating];

    children.push(
      new Paragraph({
        spacing: { before: 200 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 24, color: 'C5985E' },
        },
        children: [
          new TextRun({ text: expert.name, bold: true, size: 24 }),
          new TextRun({ text: '  |  ', color: '999999' }),
          new TextRun({ text: expert.rating.replace('_', ' '), bold: true, color: ratingColor }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: expert.credentials, italics: true, size: 20, color: '666666' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Framework: ${expert.framework}`, size: 20, color: 'C5985E' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: expert.analysis, size: 22 }),
        ],
      }),
    );
  }

  // Outstanding Diligence Section
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'OUTSTANDING DILIGENCE',
          bold: true,
          color: '1B2A4A',
          size: 28,
        }),
      ],
    }),
  );

  const categoryLabels = {
    gating: 'Gating Items (Must resolve before investment)',
    pre_close: 'Pre-Close Items (Required before closing)',
    supplementary: 'Supplementary Items (Nice to have)',
  };

  const categoryColors = {
    gating: 'dc2626',
    pre_close: 'd97706',
    supplementary: '2563eb',
  };

  for (const category of ['gating', 'pre_close', 'supplementary'] as const) {
    const items = data.diligenceItems.filter(item => item.category === category);
    if (items.length === 0) continue;

    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: categoryLabels[category],
            bold: true,
            color: categoryColors[category],
          }),
        ],
      }),
    );

    for (const item of items) {
      const priorityColor = item.priority === 'high' ? 'dc2626' : item.priority === 'medium' ? 'd97706' : '2563eb';
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: item.item }),
            new TextRun({ text: ` [${item.priority.toUpperCase()}]`, color: priorityColor, bold: true, size: 18 }),
          ],
        }),
      );
    }
  }

  // Investment Recommendation
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'INVESTMENT RECOMMENDATION',
          bold: true,
          color: '1B2A4A',
          size: 32,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: 'F3F4F6' },
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: data.recommendation.verdict.replace('_', ' '),
          bold: true,
          size: 48,
          color: verdictColors[data.recommendation.verdict],
        }),
        new TextRun({ text: '   ' }),
        new TextRun({
          text: `${data.recommendation.confidence}% Confidence`,
          size: 28,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: data.recommendation.summary, size: 24 }),
      ],
    }),
  );

  if (data.recommendation.conditions && data.recommendation.conditions.length > 0) {
    children.push(
      new Paragraph({
        shading: { fill: 'FEF3C7' },
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'Conditions for Investment:',
            bold: true,
            color: 'd97706',
          }),
        ],
      }),
    );

    for (const condition of data.recommendation.conditions) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: condition })],
        }),
      );
    }
  }

  // Footer with timestamp
  children.push(
    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated by IOTD Platform • ${new Date().toISOString()}`,
          size: 18,
          color: '999999',
          italics: true,
        }),
      ],
    }),
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Generate PDF document from IC Memo data
 */
export function generateICMemoPdf(data: ICMemoExportData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    info: {
      Title: `IC Memo - ${data.ideaTitle}`,
      Author: 'IOTD Platform',
      Subject: `Tier ${data.tier} Investment Committee Memorandum`,
      Creator: 'IOTD IC Memo Generator',
    },
  });

  const colors = {
    primary: '#1B2A4A',
    accent: '#C5985E',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
    blue: '#2563eb',
    gray: '#666666',
    lightGray: '#F3F4F6',
  };

  const tierLabels = {
    1: 'Thesis Assessment',
    2: 'Preliminary Memo',
    3: 'Full IC Memorandum',
  };

  // Helper functions
  const addTitle = (text: string, size: number = 24, color: string = colors.primary) => {
    doc.fontSize(size).fillColor(color).font('Helvetica-Bold').text(text, { align: 'left' });
    doc.moveDown(0.5);
  };

  const addParagraph = (text: string, size: number = 11) => {
    // Process confidence tags
    const processed = text
      .replace(/\[VERIFIED\]/g, '[V]')
      .replace(/\[ESTIMATED\]/g, '[E]')
      .replace(/\[UNVERIFIED\]/g, '[U]')
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markers (PDF doesn't support inline styling easily)
      .replace(/#{1,6}\s+/g, '');

    doc.fontSize(size).fillColor('#333333').font('Helvetica').text(processed, {
      align: 'justify',
      lineGap: 3,
    });
    doc.moveDown(0.5);
  };

  const addBullet = (text: string, size: number = 11) => {
    const processed = text
      .replace(/\[VERIFIED\]/g, '[V]')
      .replace(/\[ESTIMATED\]/g, '[E]')
      .replace(/\[UNVERIFIED\]/g, '[U]')
      .replace(/\*\*([^*]+)\*\*/g, '$1');

    doc.fontSize(size).fillColor('#333333').font('Helvetica').text(`• ${processed}`, {
      indent: 20,
      lineGap: 2,
    });
  };

  const checkPageBreak = (neededSpace: number = 100) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - neededSpace) {
      doc.addPage();
    }
  };

  // ==================== TITLE PAGE ====================
  doc.moveDown(4);
  doc.fontSize(36).fillColor(colors.primary).font('Helvetica-Bold')
    .text('INVESTMENT COMMITTEE', { align: 'center' });
  doc.fontSize(36).fillColor(colors.primary).font('Helvetica-Bold')
    .text('MEMORANDUM', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(24).fillColor(colors.accent).font('Helvetica-Bold')
    .text(data.ideaTitle, { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(16).fillColor(colors.gray).font('Helvetica')
    .text(`Tier ${data.tier}: ${tierLabels[data.tier]}`, { align: 'center' });
  doc.fontSize(14).fillColor(colors.gray)
    .text(`Data Completeness: ${data.completenessScore}%`, { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).fillColor(colors.gray).font('Helvetica-Oblique')
    .text(`Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, { align: 'center' });

  // ==================== DISCLAIMER ====================
  doc.addPage();

  if (data.disclaimer) {
    addTitle('DISCLAIMER', 18);
    doc.rect(doc.x - 10, doc.y - 5, doc.page.width - doc.page.margins.left - doc.page.margins.right + 20, 60)
      .fill('#FEF3C7');
    doc.fillColor(colors.amber).fontSize(11).font('Helvetica-Oblique')
      .text(data.disclaimer, doc.x, doc.y + 5, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
    doc.moveDown(2);
  }

  // ==================== CONFIDENCE SUMMARY ====================
  addTitle('CONFIDENCE SUMMARY', 18);

  // Simple text-based table for confidence stats
  doc.fontSize(11).font('Helvetica');
  doc.fillColor(colors.green).text(`Verified [V]: ${data.confidenceStats.verified} — Directly from provided data or cited sources`);
  doc.fillColor(colors.amber).text(`Estimated [E]: ${data.confidenceStats.estimated} — Calculated from benchmarks or comparable data`);
  doc.fillColor(colors.red).text(`Unverified [U]: ${data.confidenceStats.unverified} — Requires additional diligence to confirm`);
  doc.moveDown(2);

  // ==================== MEMO SECTIONS ====================
  for (const section of data.sections) {
    checkPageBreak(150);

    // Section title
    addTitle(section.title.toUpperCase(), 16);

    // Confidence tags for section
    doc.fontSize(10).font('Helvetica');
    doc.fillColor(colors.gray).text('Confidence: ', { continued: true });
    doc.fillColor(colors.green).text(`${section.confidenceTags.verified}V `, { continued: true });
    doc.fillColor(colors.amber).text(`${section.confidenceTags.estimated}E `, { continued: true });
    doc.fillColor(colors.red).text(`${section.confidenceTags.unverified}U`);
    doc.moveDown(0.5);

    // Parse content
    const elements = parseMarkdownToParagraphs(section.content);

    for (const element of elements) {
      checkPageBreak(50);

      if (element.type === 'heading') {
        doc.moveDown(0.5);
        doc.fontSize(13).fillColor(colors.primary).font('Helvetica-Bold')
          .text(stripMarkdown(element.text));
        doc.moveDown(0.3);
      } else if (element.type === 'bullet') {
        addBullet(element.text);
      } else if (element.type === 'paragraph' && element.text.trim()) {
        addParagraph(element.text);
      }
    }

    doc.moveDown(1);
  }

  // ==================== EXPERT PANEL ====================
  doc.addPage();
  addTitle('EXPERT PANEL ASSESSMENT', 20);

  for (const expert of data.expertPanel) {
    checkPageBreak(150);

    const ratingColor = {
      STRONG_INVEST: colors.green,
      INVEST: colors.green,
      CONDITIONAL: colors.amber,
      CAUTIOUS: colors.amber,
      PASS: colors.red,
    }[expert.rating];

    // Expert name and rating
    doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold')
      .text(expert.name, { continued: true });
    doc.fillColor(colors.gray).font('Helvetica').text('  |  ', { continued: true });
    doc.fillColor(ratingColor).font('Helvetica-Bold')
      .text(expert.rating.replace('_', ' '));

    // Credentials
    doc.fontSize(10).fillColor(colors.gray).font('Helvetica-Oblique')
      .text(expert.credentials);

    // Framework
    doc.fontSize(10).fillColor(colors.accent).font('Helvetica')
      .text(`Framework: ${expert.framework}`);
    doc.moveDown(0.3);

    // Analysis
    addParagraph(expert.analysis, 10);
    doc.moveDown(1);
  }

  // ==================== OUTSTANDING DILIGENCE ====================
  checkPageBreak(200);
  addTitle('OUTSTANDING DILIGENCE', 20);

  const categoryLabels = {
    gating: 'Gating Items (Must resolve before investment)',
    pre_close: 'Pre-Close Items (Required before closing)',
    supplementary: 'Supplementary Items (Nice to have)',
  };

  const categoryColors = {
    gating: colors.red,
    pre_close: colors.amber,
    supplementary: colors.blue,
  };

  for (const category of ['gating', 'pre_close', 'supplementary'] as const) {
    const items = data.diligenceItems.filter(item => item.category === category);
    if (items.length === 0) continue;

    checkPageBreak(80);
    doc.fontSize(12).fillColor(categoryColors[category]).font('Helvetica-Bold')
      .text(categoryLabels[category]);
    doc.moveDown(0.3);

    for (const item of items) {
      const priorityColor = item.priority === 'high' ? colors.red : item.priority === 'medium' ? colors.amber : colors.blue;
      doc.fontSize(10).fillColor('#333333').font('Helvetica')
        .text(`• ${item.item}`, { continued: true });
      doc.fillColor(priorityColor).font('Helvetica-Bold')
        .text(` [${item.priority.toUpperCase()}]`);
    }
    doc.moveDown(0.5);
  }

  // ==================== INVESTMENT RECOMMENDATION ====================
  doc.addPage();
  addTitle('INVESTMENT RECOMMENDATION', 24);
  doc.moveDown(1);

  const verdictColor = {
    INVEST: colors.green,
    CONDITIONAL: colors.amber,
    MORE_DATA: colors.blue,
    PASS: colors.red,
  }[data.recommendation.verdict];

  // Verdict box
  doc.rect(72, doc.y, doc.page.width - 144, 80).fill(colors.lightGray);
  doc.fontSize(36).fillColor(verdictColor).font('Helvetica-Bold')
    .text(data.recommendation.verdict.replace('_', ' '), { align: 'center' });
  doc.fontSize(18).fillColor(colors.gray).font('Helvetica')
    .text(`${data.recommendation.confidence}% Confidence`, { align: 'center' });
  doc.moveDown(2);

  // Summary
  addParagraph(data.recommendation.summary, 12);

  // Conditions
  if (data.recommendation.conditions && data.recommendation.conditions.length > 0) {
    doc.moveDown(1);
    doc.fontSize(14).fillColor(colors.amber).font('Helvetica-Bold')
      .text('Conditions for Investment:');
    doc.moveDown(0.3);

    for (const condition of data.recommendation.conditions) {
      addBullet(condition, 11);
    }
  }

  // ==================== FOOTER ====================
  doc.moveDown(3);
  doc.fontSize(9).fillColor(colors.gray).font('Helvetica-Oblique')
    .text(`Generated by IOTD Platform • ${new Date().toISOString()}`, { align: 'center' });

  return doc;
}
