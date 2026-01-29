import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageBreak, Header } from 'docx';

export interface AppBuilderPrompt {
  promptNumber: number;
  totalPrompts: number;
  phaseName: string;
  previousContext: string;
  taskDescription: string;
  technicalSpecs: string;
  features: string[];
  uiRequirements: string[];
  completionChecklist: string[];
}

export interface AppBuilderDocument {
  appName: string;
  appDescription: string;
  prompts: AppBuilderPrompt[];
}

/**
 * Generate a Word document (.docx) containing App Builder Prompts
 * designed for no-code builders like Lovable, Claude Code, and Replit
 */
export async function generateAppBuilderDocx(data: AppBuilderDocument): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${data.appName} - App Builder Prompts`,
                    size: 20,
                    color: "666666",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: data.appName,
                bold: true,
                size: 48,
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "App Builder Prompts",
                size: 32,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Separator line
          new Paragraph({
            children: [new TextRun({ text: "═".repeat(60), color: "CCCCCC" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Instructions section
          new Paragraph({
            children: [
              new TextRun({
                text: "INSTRUCTIONS FOR USE",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Each numbered prompt below is meant to be copied and pasted one at a time into your no-code builder (Lovable, Claude Code, Replit, etc.).",
                size: 22,
              }),
            ],
            spacing: { after: 100 },
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Complete each prompt before moving to the next. Wait for the AI builder to finish generating before proceeding.",
                size: 22,
              }),
            ],
            spacing: { after: 100 },
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The prompts build on each other - each one assumes the previous prompts have been completed.",
                size: 22,
              }),
            ],
            spacing: { after: 100 },
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total prompts: ${data.prompts.length}`,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 400 },
            bullet: { level: 0 },
          }),

          // App Description
          new Paragraph({
            children: [
              new TextRun({
                text: "ABOUT THIS APP",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.appDescription,
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Separator before prompts
          new Paragraph({
            children: [new TextRun({ text: "─".repeat(60), color: "CCCCCC" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Generate each prompt section
          ...data.prompts.flatMap((prompt, index) => generatePromptSection(prompt, index === data.prompts.length - 1)),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function generatePromptSection(prompt: AppBuilderPrompt, isLast: boolean): Paragraph[] {
  const sections: Paragraph[] = [];

  // Prompt header
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `PROMPT ${prompt.promptNumber} of ${prompt.totalPrompts}: ${prompt.phaseName}`,
          bold: true,
          size: 32,
          color: "2563EB", // Blue color
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 100 },
    })
  );

  // Separator under header
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "═".repeat(50), color: "2563EB" })],
      spacing: { after: 300 },
    })
  );

  // Copy-paste box start indicator
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "┌─── COPY FROM HERE ───────────────────────────────────────────────",
          size: 18,
          color: "16A34A", // Green color
          bold: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Task description (always first in the prompt)
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: prompt.taskDescription,
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Previous context (if not the first prompt)
  if (prompt.previousContext && prompt.previousContext.trim()) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "\nWHAT HAS BEEN BUILT SO FAR:",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: prompt.previousContext,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Technical specifications
  if (prompt.technicalSpecs && prompt.technicalSpecs.trim()) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "\nTECHNICAL SPECIFICATIONS:",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: prompt.technicalSpecs,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Features to implement
  if (prompt.features && prompt.features.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "\nFEATURES TO IMPLEMENT:",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    prompt.features.forEach((feature, idx) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. ${feature}`,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // UI/UX requirements
  if (prompt.uiRequirements && prompt.uiRequirements.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "\nUI/UX REQUIREMENTS:",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    prompt.uiRequirements.forEach((req) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${req}`,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // Completion checklist
  if (prompt.completionChecklist && prompt.completionChecklist.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "\nWHEN COMPLETE, THE APP SHOULD:",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    prompt.completionChecklist.forEach((item) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `☐ ${item}`,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // Copy-paste box end indicator
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "└─── COPY TO HERE ─────────────────────────────────────────────────",
          size: 18,
          color: "16A34A", // Green color
          bold: true,
        }),
      ],
      spacing: { before: 200, after: 400 },
    })
  );

  // Add page break between prompts (except for the last one)
  if (!isLast) {
    sections.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  return sections;
}
