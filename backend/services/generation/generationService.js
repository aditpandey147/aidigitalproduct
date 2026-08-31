// backend/services/generation/generationService.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Product = require("../../models/Product");
const HtmlToPdfConverter = require("./htmlToPdfConverter");
const MarketingKitGenerator = require("./marketingKitGenerator");
const ExcelGenerator = require("./excelGenerator");
const CoverImageGenerator = require("./coverImageGenerator");

// ================================================================
// CONTENT GENERATOR
// ================================================================

class ContentGenerator {
  constructor(productData) {
    this.productData = productData;
    this.content = {
      outline: [],
      fullContent: "",
      chapters: [],
      prompts: [],
      items: [],
      exercises: [],
      sheets: null,
      course: null,
    };
  }

  async generateContent() {
    console.log("🤖 Generating content with DeepSeek...");

    const { productType } = this.productData;

    console.log(`📝 Product Type: ${productType}`);

    switch (productType) {
      case "prompt-packs":
      case "prompt packs":
        return await this._generatePromptPack();
      case "checklists":
      case "checklist":
        return await this._generateChecklist();
      case "workbook":
      case "workbooks":
        return await this._generateWorkbook();
      case "spreadsheets":
      case "spreadsheet":
        return await this._generateSpreadsheet();
      case "mini-courses":
      case "mini course":
        return await this._generateMiniCourse();
      case "guide":
      case "guides":
      case "ebook":
      case "ebooks":
      case "planner":
      case "planners":
      case "challenges":
      case "challenge":
        return await this._generateChallenge();
      case "templates":
      case "template":
        return await this._generateTemplate();
      case "worksheets":
      case "worksheet":
        return await this._generateWorksheet();
      default:
        return await this._generateChapters();
    }
  }

  // ================================================================
  // GENERATE MINI COURSE
  // ================================================================

  async _generateMiniCourse() {
    console.log("  🎓 Generating Mini Course...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive mini course about "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Generate a complete course with:
1. A course introduction
2. 3-5 modules with titles and content
3. Each module has 2-4 lessons with full content
4. Include quizzes or assignments at the end of modules

Format the course as a structured document with:
- Start with "## Course Introduction: [title]"
- Then "## Module 1: [title]" with content
- Then "### Lesson 1.1: [title]" with content
- Continue for all modules and lessons
- Add "### Quiz: Module 1" or "### Assignment: Module 1" where appropriate

Write in a ${tone.toLowerCase()} tone. Make it practical, actionable, and engaging.
Use clear paragraphs with proper punctuation.
Use **bold** for important concepts.
Use bullet points with • for lists.

Return ONLY the course content, no other text.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert course creator. Create comprehensive, engaging mini courses with modules and lessons. Use markdown formatting with ## for modules and ### for lessons.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      let courseContent = response.data.choices[0].message.content;
      courseContent = courseContent
        .replace(/```markdown/g, "")
        .replace(/```/g, "")
        .trim();

      const chapters = this._parseCourseToChapters(courseContent);

      this.content.chapters = chapters;
      this.content.fullContent = courseContent;
      this.content.course = { chapters, fullContent: courseContent };

      console.log(`  ✅ Generated ${chapters.length} course sections`);
      return this.content;
    } catch (error) {
      console.error("❌ Mini Course generation failed:", error.message);
      const fallbackContent = this._getFallbackCourseContent();
      this.content.chapters = this._parseCourseToChapters(fallbackContent);
      this.content.fullContent = fallbackContent;
      this.content.course = {
        chapters: this.content.chapters,
        fullContent: fallbackContent,
      };
      return this.content;
    }
  }

  _parseCourseToChapters(content) {
    const chapters = [];
    const lines = content.split("\n");
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (
        trimmed.startsWith("## Course Introduction:") ||
        trimmed.startsWith("## Introduction:")
      ) {
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.replace(/^##\s*/, "").trim();
        currentChapter = {
          title: `Course Introduction: ${title}`,
          content: "",
        };
        currentContent = [];
      } else if (trimmed.startsWith("## Module") && trimmed.length > 3) {
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.replace(/^##\s*/, "").trim();
        currentChapter = { title: title, content: "" };
        currentContent = [];
      } else if (trimmed.startsWith("### ") && trimmed.length > 4) {
        if (currentChapter) {
          currentContent.push(trimmed);
        } else {
          if (currentChapter) {
            currentChapter.content = currentContent.join("\n").trim();
            if (currentChapter.content) chapters.push(currentChapter);
          }
          const title = trimmed.replace(/^###\s*/, "").trim();
          currentChapter = { title: title, content: "" };
          currentContent = [];
        }
      } else if (
        trimmed.startsWith("### Quiz:") ||
        trimmed.startsWith("### Assignment:")
      ) {
        if (currentChapter) {
          currentContent.push(trimmed);
        } else {
          const title = trimmed.replace(/^###\s*/, "").trim();
          currentChapter = { title: title, content: "" };
          currentContent = [];
        }
      } else if (trimmed && currentChapter) {
        currentContent.push(trimmed);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join("\n").trim();
      if (currentChapter.content) chapters.push(currentChapter);
    }

    return chapters;
  }

  _getFallbackCourseContent() {
    const { title, outcome } = this.productData;
    return `## Course Introduction: ${title}

Welcome to this comprehensive mini course on ${title}. This course is designed to help you ${outcome}.

**What you'll learn:**
• Understand the core concepts
• Apply practical techniques
• Achieve your goals

## Module 1: Getting Started

This module covers the fundamentals and sets the foundation for your learning journey.

### Lesson 1.1: Introduction to ${title}

Welcome to the first lesson. In this lesson, we'll cover the basics of ${title} and why it's important.

**Key concepts:**
• Concept 1
• Concept 2
• Concept 3

### Lesson 1.2: Core Principles

Now that you understand the basics, let's dive deeper into the core principles.

### Quiz: Module 1

1. What is the main purpose of ${title}?
2. List three key concepts from this module.
3. How can you apply what you've learned?

## Module 2: Practical Application

This module focuses on applying what you've learned in real-world scenarios.

### Lesson 2.1: Real-World Application

Learn how to apply the concepts in practical situations.

### Lesson 2.2: Advanced Techniques

Take your skills to the next level with advanced techniques.

### Assignment: Module 2

Apply the concepts from this module to a real-world scenario of your choice.

## Module 3: Mastery

This module helps you achieve mastery and confidence in your skills.

### Lesson 3.1: Expert Tips

Learn expert tips and strategies for success.

### Lesson 3.2: Next Steps

Plan your next steps and continue your learning journey.

## Course Conclusion

Congratulations on completing this mini course! You now have the knowledge and skills to ${outcome}.`;
  }

  // ================================================================
  // GENERATE SPREADSHEET
  // ================================================================

  async _generateSpreadsheet() {
    console.log("  📊 Generating Spreadsheet specification...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive spreadsheet specification for a digital product.

Product Title: ${title}
Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Create a detailed spreadsheet with multiple sheets that will help users track and manage their ${niche} journey.

Generate a spreadsheet specification with:
1. 3-5 sheets with relevant names
2. Each sheet should have columns with appropriate headers
3. Include data types (text, number, date, boolean, formula)
4. Include sample data (5-10 rows per sheet)
5. Include formulas where appropriate (SUM, AVERAGE, COUNT, etc.)
6. Include formatting suggestions (colors, borders, etc.)

Format as JSON with this exact structure:
{
  "sheets": [
    {
      "name": "Sheet Name",
      "description": "What this sheet is for",
      "columns": [
        { "header": "Column Name", "type": "text|number|date|boolean|formula", "width": 20 },
        { "header": "Another Column", "type": "text", "width": 25 }
      ],
      "rows": [
        ["value1", "value2", "value3"],
        ["value1", "value2", "value3"]
      ],
      "formulas": {
        "cell": "=SUM(A1:A10)",
        "cell2": "=AVERAGE(B1:B10)"
      }
    }
  ]
}

Return ONLY the JSON, no other text.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert spreadsheet designer. Create detailed spreadsheet specifications. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let spec = {};

      if (jsonMatch) {
        spec = JSON.parse(jsonMatch[0]);
      } else {
        spec = JSON.parse(content);
      }

      this.content.sheets = spec;
      this.content.fullContent = JSON.stringify(spec, null, 2);

      console.log(`  ✅ Generated ${spec.sheets?.length || 0} sheets`);
      return this.content;
    } catch (error) {
      console.error("❌ Spreadsheet generation failed:", error.message);
      this.content.sheets = this._getFallbackSpreadsheet();
      this.content.fullContent = JSON.stringify(this.content.sheets, null, 2);
      return this.content;
    }
  }

  _getFallbackSpreadsheet() {
    return {
      sheets: [
        {
          name: "Overview",
          description: "Main tracker sheet",
          columns: [
            { header: "Date", type: "date", width: 15 },
            { header: "Activity", type: "text", width: 30 },
            { header: "Duration", type: "number", width: 15 },
            { header: "Status", type: "text", width: 15 },
            { header: "Notes", type: "text", width: 35 },
          ],
          rows: [
            [
              "2024-01-01",
              "Morning Workout",
              45,
              "Completed",
              "Great session!",
            ],
            ["2024-01-02", "Evening Run", 30, "Completed", "Felt good"],
            ["2024-01-03", "Rest Day", 0, "Skipped", "Needed rest"],
          ],
          formulas: {
            E1: "=SUM(C2:C10)",
          },
        },
      ],
    };
  }

  // ================================================================
  // GENERATE WORKSHEET
  // ================================================================

  async _generateWorksheet() {
    console.log("  📝 Generating Worksheet...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive worksheet about "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Generate a worksheet with 8-12 sections. Each section should have:
1. A title
2. Educational content (2-3 paragraphs)
3. Practical exercises/activities
4. Reflection questions
5. Space for user to write answers

Format the worksheet as a structured document with:
- Start with "## Worksheet: [title]"
- Then "## Section 1: [title]" with content
- Then "### Activity: [title]" with exercise
- Then "### Reflection: [title]" with questions
- Continue for all sections

Write in a ${tone.toLowerCase()} tone. Make it practical, actionable, and engaging.
Use clear paragraphs with proper punctuation.
Use **bold** for important concepts.
Use bullet points with • for lists.

Return ONLY the worksheet content, no other text.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert worksheet creator. Create comprehensive, engaging worksheets with activities and reflection questions. Use markdown formatting with ## for sections and ### for activities.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      let worksheetContent = response.data.choices[0].message.content;
      worksheetContent = worksheetContent
        .replace(/```markdown/g, "")
        .replace(/```/g, "")
        .trim();

      // Parse worksheet into chapters/sections
      const chapters = this._parseWorksheetToChapters(worksheetContent);

      this.content.chapters = chapters;
      this.content.fullContent = worksheetContent;
      this.content.worksheet = { chapters, fullContent: worksheetContent };

      console.log(`  ✅ Generated ${chapters.length} worksheet sections`);
      return this.content;
    } catch (error) {
      console.error("❌ Worksheet generation failed:", error.message);
      const fallbackContent = this._getFallbackWorksheetContent();
      this.content.chapters = this._parseWorksheetToChapters(fallbackContent);
      this.content.fullContent = fallbackContent;
      this.content.worksheet = {
        chapters: this.content.chapters,
        fullContent: fallbackContent,
      };
      return this.content;
    }
  }

  // ================================================================
  // PARSE WORKSHEET TO CHAPTERS
  // ================================================================

  _parseWorksheetToChapters(content) {
    const chapters = [];
    const lines = content.split("\n");
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (
        trimmed.startsWith("## Worksheet:") ||
        trimmed.startsWith("## Section")
      ) {
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.replace(/^##\s*/, "").trim();
        currentChapter = { title: title, content: "" };
        currentContent = [];
      } else if (trimmed.startsWith("### ") && trimmed.length > 4) {
        // Keep activities and reflections as part of the section
        if (currentChapter) {
          currentContent.push(trimmed);
        } else {
          if (currentChapter) {
            currentChapter.content = currentContent.join("\n").trim();
            if (currentChapter.content) chapters.push(currentChapter);
          }
          const title = trimmed.replace(/^###\s*/, "").trim();
          currentChapter = { title: title, content: "" };
          currentContent = [];
        }
      } else if (trimmed && currentChapter) {
        currentContent.push(trimmed);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join("\n").trim();
      if (currentChapter.content) chapters.push(currentChapter);
    }

    return chapters;
  }

  // ================================================================
  // FALLBACK WORKSHEET CONTENT
  // ================================================================

  _getFallbackWorksheetContent() {
    const { title, outcome } = this.productData;
    return `## Worksheet: ${title}

Welcome to this comprehensive worksheet designed to help you ${outcome}.

## Section 1: Getting Started

This section covers the fundamentals and helps you prepare for success.

### Activity: Define Your Goals

Take a moment to write down your goals for this worksheet.

1. What do you hope to achieve?
2. What challenges are you facing?
3. What would success look like?

### Reflection: Self-Assessment

Think about where you are now and where you want to be.

• What's working well?
• What needs improvement?
• What support do you need?

## Section 2: Core Concepts

This section covers the key concepts and principles.

### Activity: Identify Key Concepts

Review the material and identify the most important concepts.

1. Concept 1: _______________
2. Concept 2: _______________
3. Concept 3: _______________

### Reflection: Application

How can you apply these concepts to your situation?

• What's one thing you can do today?
• What's your biggest takeaway?

## Section 3: Action Plan

This section helps you create a practical action plan.

### Activity: Create Your Plan

Create a step-by-step plan to achieve your goals.

Step 1: _______________
Step 2: _______________
Step 3: _______________

### Reflection: Next Steps

What are your next steps after completing this worksheet?

• What will you do first?
• How will you stay motivated?
• When will you review your progress?

## Section 4: Progress Review

This section helps you track your progress.

### Activity: Track Your Progress

Track your progress toward your goals.

Goal: _______________
Progress: _______________
Challenges: _______________
Successes: _______________

### Reflection: Celebrate Your Wins

Take time to celebrate your achievements.

• What are you proud of?
• What have you learned?
• What's next for you?`;
  }

  // ================================================================
  // GENERATE WORKBOOK
  // ================================================================

  async _generateWorkbook() {
    console.log("  📝 Generating Workbook...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive workbook about "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Generate a workbook with 6-8 sections. Each section should have:
1. A title
2. Educational content (2-3 paragraphs)
3. Exercises/activities for the user to complete
4. Reflection questions

Format as JSON array with:
- title: Section title
- content: Educational content
- exercises: Array of exercise descriptions
- reflection: Array of reflection questions

Return ONLY the JSON array.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert workbook creator. Generate engaging, practical workbooks. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let workbook = [];

      if (jsonMatch) {
        workbook = JSON.parse(jsonMatch[0]);
      } else {
        workbook = JSON.parse(content);
      }

      this.content.chapters = workbook.map((section) => ({
        title: section.title,
        content: section.content,
      }));

      this.content.exercises = workbook;

      let fullContent = "";
      for (const section of workbook) {
        fullContent += `## ${section.title}\n\n`;
        fullContent += `${section.content}\n\n`;
        if (section.exercises && section.exercises.length > 0) {
          fullContent += `**Exercises:**\n`;
          for (const exercise of section.exercises) {
            fullContent += `• ${exercise}\n`;
          }
          fullContent += "\n";
        }
        if (section.reflection && section.reflection.length > 0) {
          fullContent += `**Reflection Questions:**\n`;
          for (const question of section.reflection) {
            fullContent += `• ${question}\n`;
          }
          fullContent += "\n";
        }
      }
      this.content.fullContent = fullContent;

      console.log(`  ✅ Generated ${workbook.length} workbook sections`);
      return this.content;
    } catch (error) {
      console.error("❌ Workbook generation failed:", error.message);
      return await this._generateChapters();
    }
  }

  // ================================================================
  // GENERATE PROMPT PACK
  // ================================================================

  async _generatePromptPack() {
    console.log("  📝 Generating Prompt Pack...");

    const { title, niche, audience, problem, outcome } = this.productData;

    const prompt = `Generate a comprehensive prompt pack for "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate 20-30 AI prompts organized into categories.
Each prompt should be clear, specific, and actionable.

Format as JSON array with:
- category: The category name
- prompts: Array of prompt objects with "title" and "prompt" fields

Return ONLY the JSON array.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert prompt engineer. Generate high-quality AI prompts. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let prompts = [];

      if (jsonMatch) {
        prompts = JSON.parse(jsonMatch[0]);
      } else {
        prompts = JSON.parse(content);
      }

      this.content.prompts = prompts;

      let fullContent = "# Prompt Pack\n\n";
      for (const category of prompts) {
        fullContent += `## ${category.category}\n\n`;
        for (const item of category.prompts) {
          fullContent += `### ${item.title}\n`;
          fullContent += `${item.prompt}\n\n`;
        }
      }
      this.content.fullContent = fullContent;

      console.log(`  ✅ Generated ${prompts.length} prompt categories`);
      return this.content;
    } catch (error) {
      console.error("❌ Prompt pack generation failed:", error.message);
      throw error;
    }
  }

  // ================================================================
  // GENERATE CHECKLIST - FIXED
  // ================================================================

  async _generateChecklist() {
    console.log("  📝 Generating Checklist...");

    const { title, niche, audience, problem, outcome } = this.productData;

    const prompt = `Generate a comprehensive checklist for "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate 20-30 checklist items organized into 3-5 categories.
Each item should be a clear, actionable task.

Format as JSON array with:
- category: The category name
- items: Array of checklist items (strings)

Example format:
[
  {
    "category": "Category Name",
    "items": ["Item 1", "Item 2", "Item 3"]
  }
]

Return ONLY the valid JSON array. No additional text. Ensure proper JSON syntax with no trailing commas.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at creating checklists. Return only valid JSON with proper syntax. No trailing commas.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      let content = response.data.choices[0].message.content;
      content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // ✅ Find JSON array in the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let items = [];

      if (jsonMatch) {
        try {
          items = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn("  ⚠️ First parse attempt failed, trying to clean...");
          // Try to clean common JSON issues
          let cleaned = jsonMatch[0]
            .replace(/,(\s*})/g, "$1") // Remove trailing commas before }
            .replace(/,(\s*\])/g, "$1") // Remove trailing commas before ]
            .replace(/\n/g, " ") // Remove newlines
            .replace(/\s+/g, " ") // Collapse spaces
            .trim();

          try {
            items = JSON.parse(cleaned);
          } catch (secondError) {
            console.error(
              "  ❌ JSON parse failed after cleaning:",
              secondError.message,
            );
            throw new Error("Invalid JSON response from AI");
          }
        }
      } else {
        // Try to parse the entire content
        try {
          items = JSON.parse(content);
        } catch (parseError) {
          console.error("  ❌ No JSON array found in response");
          throw new Error("No valid JSON array found in response");
        }
      }

      // ✅ Validate and sanitize the items
      if (!Array.isArray(items)) {
        throw new Error("Response is not an array");
      }

      // ✅ Ensure each item has category and items array
      const sanitizedItems = items.map((category) => ({
        category: category.category || "Uncategorized",
        items: Array.isArray(category.items) ? category.items : [],
      }));

      this.content.items = sanitizedItems;

      let fullContent = "# Checklist\n\n";
      for (const category of sanitizedItems) {
        fullContent += `## ${category.category}\n\n`;
        for (const item of category.items) {
          fullContent += `☐ ${item}\n`;
        }
        fullContent += "\n";
      }
      this.content.fullContent = fullContent;

      console.log(
        `  ✅ Generated ${sanitizedItems.length} checklist categories`,
      );
      return this.content;
    } catch (error) {
      console.error("❌ Checklist generation failed:", error.message);
      // ✅ Return fallback checklist instead of throwing
      const fallbackItems = [
        {
          category: "Getting Started",
          items: [
            "Define your goals",
            "Create a plan",
            "Set up your workspace",
            "Gather necessary resources",
          ],
        },
        {
          category: "Action Steps",
          items: [
            "Take first action step",
            "Track your progress",
            "Review and adjust",
            "Celebrate small wins",
          ],
        },
        {
          category: "Completion",
          items: [
            "Review all steps",
            "Document your results",
            "Share your success",
            "Plan next steps",
          ],
        },
      ];

      this.content.items = fallbackItems;
      let fullContent = "# Checklist\n\n";
      for (const category of fallbackItems) {
        fullContent += `## ${category.category}\n\n`;
        for (const item of category.items) {
          fullContent += `☐ ${item}\n`;
        }
        fullContent += "\n";
      }
      this.content.fullContent = fullContent;
      console.log("  ✅ Using fallback checklist");
      return this.content;
    }
  }

  // backend/services/generation/generationService.js
  // Add this method inside the ContentGenerator class

  // ================================================================
  // GENERATE CHALLENGE
  // ================================================================

  async _generateChallenge() {
    console.log("  🏆 Generating Challenge...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive challenge program for "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Generate a complete challenge program with:

1. **Challenge Overview**: Introduction, rules, and expectations
2. **Daily Structure**: 7-30 days of activities (choose appropriate length based on topic)
3. **Daily Tasks**: Clear, actionable tasks for each day
4. **Progress Tracking**: Methods to track progress
5. **Milestones**: Key achievements along the way
6. **Rewards**: Incentives and celebration points
7. **Community/Social**: Ways to stay accountable
8. **Completion Certificate**: Recognition of achievement

Format the challenge as a structured document with:
- Start with "## Challenge: [title]"
- Then "## Day 1: [theme]" with daily content
- Continue for all days
- Include "## Progress Tracker" section
- Include "## Completion Certificate" at the end

Each day should include:
- Daily theme/title
- Main task (the "mission" for the day)
- 2-3 supporting activities
- Reflection question
- Quick win or small victory

Write in a motivating, encouraging ${tone.toLowerCase()} tone. Make it practical, actionable, and engaging.
Use **bold** for important concepts.
Use bullet points with • for lists.

Return ONLY the challenge content, no other text.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert challenge designer. Create comprehensive, motivating challenge programs with daily tasks, progress tracking, and rewards. Use markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 5000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      let challengeContent = response.data.choices[0].message.content;
      challengeContent = challengeContent
        .replace(/```markdown/g, "")
        .replace(/```/g, "")
        .trim();

      // Parse challenge into chapters/days
      const chapters = this._parseChallengeToChapters(challengeContent);

      this.content.chapters = chapters;
      this.content.fullContent = challengeContent;
      this.content.challenge = { chapters, fullContent: challengeContent };

      console.log(`  ✅ Generated ${chapters.length} challenge days`);
      return this.content;
    } catch (error) {
      console.error("❌ Challenge generation failed:", error.message);
      const fallbackContent = this._getFallbackChallengeContent();
      this.content.chapters = this._parseChallengeToChapters(fallbackContent);
      this.content.fullContent = fallbackContent;
      this.content.challenge = {
        chapters: this.content.chapters,
        fullContent: fallbackContent,
      };
      return this.content;
    }
  }

  // ================================================================
  // PARSE CHALLENGE TO CHAPTERS
  // ================================================================

  _parseChallengeToChapters(content) {
    const chapters = [];
    const lines = content.split("\n");
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Match Challenge header, Day headers, or any ## headers
      if (trimmed.startsWith("## ") && trimmed.length > 3) {
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.replace(/^##\s*/, "").trim();
        currentChapter = { title: title, content: "" };
        currentContent = [];
      } else if (trimmed && currentChapter) {
        currentContent.push(trimmed);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join("\n").trim();
      if (currentChapter.content) chapters.push(currentChapter);
    }

    return chapters;
  }

  // ================================================================
  // FALLBACK CHALLENGE CONTENT
  // ================================================================

  _getFallbackChallengeContent() {
    const { title, outcome } = this.productData;
    return `## Challenge: ${title}

Welcome to the ${title} Challenge! This program is designed to help you ${outcome}.

## Challenge Overview

**Duration:** 7 Days
**Goal:** ${outcome}
**Commitment:** 15-20 minutes per day

### Rules:
• Complete the daily task
• Track your progress
• Share your wins
• Stay committed

### What You'll Need:
• A notebook or journal
• 15-20 minutes each day
• An open mind and willingness to grow

## Day 1: Getting Started

### Your Mission Today:
[Describe the day 1 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 2: Building Momentum

### Your Mission Today:
[Describe the day 2 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 3: Deep Dive

### Your Mission Today:
[Describe the day 3 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 4: Overcoming Challenges

### Your Mission Today:
[Describe the day 4 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 5: Leveling Up

### Your Mission Today:
[Describe the day 5 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 6: Refining & Reflecting

### Your Mission Today:
[Describe the day 6 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Day 7: Celebration & Planning

### Your Mission Today:
[Describe the day 7 task]

### Activities:
1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

### Quick Win:
[Small achievable task]

### Reflection:
[Reflection question for the day]

## Progress Tracker

Track your daily progress:

| Day | Task | Completed | Notes |
|-----|------|-----------|-------|
| 1   |      | ☐ / ☑    |       |
| 2   |      | ☐ / ☑    |       |
| 3   |      | ☐ / ☑    |       |
| 4   |      | ☐ / ☑    |       |
| 5   |      | ☐ / ☑    |       |
| 6   |      | ☐ / ☑    |       |
| 7   |      | ☐ / ☑    |       |

## Milestones

🎯 **Milestone 1:** [Achievement at day 2-3]
🎯 **Milestone 2:** [Achievement at day 4-5]
🏆 **Final Milestone:** [Achievement at day 7]

## Rewards

⭐ **Day 1-2 Reward:** [Small reward]
⭐ **Day 3-4 Reward:** [Medium reward]
⭐ **Day 5-6 Reward:** [Large reward]
🏆 **Completion Reward:** [Grand reward]

## Community & Accountability

• Share your progress on social media with #[ChallengeHashtag]
• Find a challenge buddy
• Join the community group

## Completion Certificate

### Certificate of Achievement

This certifies that [Participant Name] has successfully completed the ${title} Challenge.

**Date:** [Completion Date]
**Signature:** [Your Name]

---

Congratulations on completing this challenge! You've taken a huge step toward ${outcome}.

**What's Next?**
• Review your progress
• Identify your biggest wins
• Plan your next challenge
• Share your success story

Remember: Every journey starts with a single step. You've taken 7 steps forward. Keep going! 💪`;
  }

  // ================================================================
  // GENERATE TEMPLATE
  // ================================================================

  async _generateTemplate() {
    console.log("  📋 Generating Template...");

    const { title, niche, audience, problem, outcome, tone } = this.productData;

    const prompt = `Create a comprehensive template for "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}
Tone: ${tone}

Generate a complete, ready-to-use template that includes:

1. **Template Overview**: What this template does and who it's for
2. **Instructions**: How to use the template effectively
3. **Sections**: 5-8 main sections with clear headings
4. **Placeholders**: Use [bracketed placeholders] for user to fill in
5. **Examples**: Provide example content where helpful
6. **Tips**: Best practices and tips for using the template

Format the template with:
- Clear section headings with ##
- Placeholders in [brackets] for user input
- Bullet points with • for lists
- Bold text for important instructions
- Numbered steps for sequential actions

The template should be practical, actionable, and ready to use immediately.

Return ONLY the template content, no other text.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert template designer. Create comprehensive, ready-to-use templates with clear sections, placeholders, and instructions. Use markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      let templateContent = response.data.choices[0].message.content;
      templateContent = templateContent
        .replace(/```markdown/g, "")
        .replace(/```/g, "")
        .trim();

      // Parse template into chapters/sections
      const chapters = this._parseTemplateToChapters(templateContent);

      this.content.chapters = chapters;
      this.content.fullContent = templateContent;
      this.content.template = { chapters, fullContent: templateContent };

      console.log(`  ✅ Generated ${chapters.length} template sections`);
      return this.content;
    } catch (error) {
      console.error("❌ Template generation failed:", error.message);
      const fallbackContent = this._getFallbackTemplateContent();
      this.content.chapters = this._parseTemplateToChapters(fallbackContent);
      this.content.fullContent = fallbackContent;
      this.content.template = {
        chapters: this.content.chapters,
        fullContent: fallbackContent,
      };
      return this.content;
    }
  }

  // ================================================================
  // PARSE TEMPLATE TO CHAPTERS
  // ================================================================

  _parseTemplateToChapters(content) {
    const chapters = [];
    const lines = content.split("\n");
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("## ") && trimmed.length > 3) {
        // Check if it's a section heading (not just any ##)
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.replace(/^##\s*/, "").trim();
        currentChapter = { title: title, content: "" };
        currentContent = [];
      } else if (trimmed && currentChapter) {
        currentContent.push(trimmed);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join("\n").trim();
      if (currentChapter.content) chapters.push(currentChapter);
    }

    return chapters;
  }

  // ================================================================
  // FALLBACK TEMPLATE CONTENT
  // ================================================================

  _getFallbackTemplateContent() {
    const { title, outcome } = this.productData;
    return `## Template: ${title}

This template is designed to help you ${outcome}. Follow the instructions below to get started.

## Overview

This template provides a comprehensive framework for ${title}.

**Who this template is for:**
• Beginners looking for structure
• Professionals seeking efficiency
• Anyone wanting to achieve ${outcome}

**What you'll get:**
• Step-by-step guidance
• Ready-to-use sections
• Fill-in-the-blank placeholders

## Instructions

1. Read through the entire template first
2. Fill in the [bracketed placeholders] with your own information
3. Customize the content to match your needs
4. Review and revise as needed

## Section 1: Getting Started

### Your Goals

[Write down your main goals for using this template]

Goal 1: _______________
Goal 2: _______________
Goal 3: _______________

### Current Situation

[Describe your current situation]

• What's working well: _______________
• What needs improvement: _______________
• What resources do you have: _______________

## Section 2: Action Plan

### Step-by-Step Plan

1. [First action step]
2. [Second action step]
3. [Third action step]
4. [Fourth action step]
5. [Fifth action step]

### Resources Needed

• Resource 1: _______________
• Resource 2: _______________
• Resource 3: _______________

### Timeline

Start date: _______________
Target completion: _______________
Milestone 1: _______________
Milestone 2: _______________

## Section 3: Content Development

### Main Content Sections

Section 1: [Section title]
- Description: _______________
- Key points: _______________

Section 2: [Section title]
- Description: _______________
- Key points: _______________

Section 3: [Section title]
- Description: _______________
- Key points: _______________

### Visual Elements

• Images needed: _______________
• Diagrams needed: _______________
• Charts needed: _______________

## Section 4: Review & Refinement

### Quality Checklist

□ All sections are complete
□ Content is accurate and relevant
□ Formatting is consistent
□ Placeholders are filled
□ Proofreading is complete

### Feedback

What worked well: _______________
What could be improved: _______________
Additional notes: _______________

## Section 5: Launch & Distribution

### Launch Plan

1. [Launch step 1]
2. [Launch step 2]
3. [Launch step 3]

### Distribution Channels

• Channel 1: _______________
• Channel 2: _______________
• Channel 3: _______________

### Marketing Strategy

[Describe your marketing approach]

## Tips for Success

• Take your time and be thorough
• Customize everything to your brand
• Test before launching
• Gather feedback and iterate
• Celebrate your progress

## Conclusion

Congratulations on completing this template! You now have a solid foundation for ${title}.

Remember: This template is a starting point. Customize it, make it your own, and use it to achieve ${outcome}.`;
  }

  // ================================================================
  // GENERATE CHAPTERS (Default)
  // ================================================================

  async _generateChapters() {
    console.log("  📝 Generating Chapters...");

    const prompts = this._buildPrompts();
    const outline = await this._generateOutline(prompts.outline);
    this.content.outline = outline;

    const chapters = [];

    for (let i = 0; i < outline.length; i++) {
      const section = outline[i];
      console.log(
        `    Writing chapter ${i + 1}/${outline.length}: ${section.title}`,
      );

      const sectionContent = await this._generateSection(
        section,
        prompts.section,
      );
      const cleanContent = this._cleanContent(sectionContent);

      chapters.push({
        title: section.title,
        content: cleanContent,
      });

      this.content.fullContent += `## ${section.title}\n\n${cleanContent}\n\n`;
    }

    this.content.chapters = chapters;
    console.log(`  ✅ Generated ${chapters.length} chapters`);
    return this.content;
  }

  _cleanContent(content) {
    let cleaned = content
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\_\_/g, "")
      .replace(/\_/g, "")
      .replace(/\#/g, "")
      .replace(/`/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .replace(/\|/g, "")
      .replace(/\>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return cleaned;
  }

  _buildPrompts() {
    const { title, niche, audience, problem, outcome, tone, productType } =
      this.productData;

    const outlinePrompt = `Create a detailed outline for a digital ${productType} about "${title}".

Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate 6-8 main chapters with clear titles and brief descriptions.
Format as JSON array with "title" and "description" fields.
Return ONLY the JSON array.`;

    const sectionPrompt = `Write the full content for this section of a digital ${productType}.

Product Title: ${title}
Niche: ${niche}
Target Audience: ${audience}
Tone: ${tone}

Write in a ${tone.toLowerCase()} tone. Make it practical, actionable, and engaging.
Use clear paragraphs with proper punctuation.
Format the content with these guidelines:
- Use **bold** for important concepts or key terms
- Use bullet points with • for lists
- Use new paragraphs for different ideas

Section Title: {section_title}
Section Description: {section_description}

Write comprehensive content for this section.`;

    return { outline: outlinePrompt, section: sectionPrompt };
  }

  async _generateOutline(prompt) {
    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert content strategist. Generate structured outlines. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error("❌ Outline generation failed:", error.message);
      throw new Error("Failed to generate outline");
    }
  }

  async _generateSection(section, promptTemplate) {
    const prompt = promptTemplate
      .replace("{section_title}", section.title)
      .replace("{section_description}", section.description);

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert writer. Write in clear, engaging prose. Use the formatting instructions provided.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 2500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ Section generation failed:", error.message);
      return "Content for this section is being generated.";
    }
  }
}

// backend/services/generation/generationService.js

class ProductGenerationService {
  constructor(productId, productData) {
    this.productId = productId;
    this.productData = { ...productData, productId };
    this.progress = 0;
  }

  // ✅ Update progress in database
  async _updateDatabaseProgress(progress, message) {
    try {
      await Product.findByIdAndUpdate(this.productId, {
        progress: progress,
        status: "generating",
      });
      console.log(`  📊 DB Progress: ${progress}% - ${message}`);
    } catch (error) {
      console.error("Failed to update database progress:", error.message);
    }
  }

  // backend/services/generation/generationService.js

  async _saveCoverImage(imageUrl, productId) {
    if (!imageUrl) return null;

    try {
      console.log("  💾 Saving cover image locally...");

      // ✅ Save to covers folder
      const coverDir = path.join(__dirname, "../../uploads/covers");
      if (!fs.existsSync(coverDir)) {
        fs.mkdirSync(coverDir, { recursive: true });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      const imageBuffer = Buffer.from(response.data);

      let extension = "png";
      try {
        const contentType = response.headers["content-type"];
        if (contentType) {
          if (contentType.includes("jpeg") || contentType.includes("jpg")) {
            extension = "jpg";
          } else if (contentType.includes("png")) {
            extension = "png";
          } else if (contentType.includes("webp")) {
            extension = "webp";
          }
        }
      } catch (e) {}

      const filename = `cover_${productId}_${Date.now()}.${extension}`;
      const filePath = path.join(coverDir, filename);
      fs.writeFileSync(filePath, imageBuffer);

      // ✅ Return the correct relative path
      const relativePath = `uploads/covers/${filename}`;
      console.log(`  ✅ Cover image saved: ${relativePath}`);

      return relativePath;
    } catch (error) {
      console.error("❌ Failed to save cover image:", error.message);
      return null;
    }
  }

  // backend/services/generation/generationService.js

  async generate() {
    console.log(`🚀 Starting generation for product ${this.productId}`);

    try {
      // Step 1: Generate Content
      this._updateProgress(0, "Generating content...");
      await this._updateDatabaseProgress(5, "Starting generation...");

      const contentGenerator = new ContentGenerator(this.productData);
      const content = await contentGenerator.generateContent();

      this._updateProgress(40, "Content generated");
      await this._updateDatabaseProgress(40, "Content generated");

      // Step 2: Generate ALL Images (Cover + Mockups + Posters)
      this._updateProgress(45, "Generating images...");
      await this._updateDatabaseProgress(45, "Generating images...");

      let allImages = null;
      let savedImages = null; // ✅ ADD THIS - to store saved image paths

      try {
        const imageGenerator = new CoverImageGenerator(this.productData);
        allImages = await imageGenerator.generateAllImages();

        if (allImages) {
          // Save all images locally - this returns the correct structure
          savedImages = await this._saveImages(allImages, this.productId);
          console.log(
            `  ✅ Saved: ${savedImages.coverImage ? "Cover, " : ""}${savedImages.mockups.length} mockups, ${savedImages.posters.length} posters`,
          );
        }
      } catch (error) {
        console.warn("⚠️ Image generation failed:", error.message);
      }

      // Step 3: Generate PDF
      this._updateProgress(70, "Creating PDF...");
      await this._updateDatabaseProgress(70, "Creating PDF...");

      const converter = new HtmlToPdfConverter(
        this.productData,
        {
          chapters: content.chapters || [],
          fullContent: content.fullContent || "",
          outline: content.outline || [],
          prompts: content.prompts || [],
          items: content.items || [],
          exercises: content.exercises || [],
        },
        savedImages?.coverImage || null, // ✅ Use savedImages
      );
      const pdfBuffer = await converter.convert();
      const filePath = await this._saveFile(pdfBuffer, "pdf");

      this._updateProgress(85, "PDF created");
      await this._updateDatabaseProgress(85, "PDF created");

      // Step 4: Generate Marketing Kit
      this._updateProgress(90, "Generating Marketing Kit...");
      await this._updateDatabaseProgress(90, "Generating Marketing Kit...");

      let marketingData = null;
      try {
        const marketingGenerator = new MarketingKitGenerator(this.productData);
        marketingData = await marketingGenerator.generateMarketingKit();
        console.log("  ✅ Marketing Kit generated");
      } catch (error) {
        console.warn("⚠️ Marketing Kit generation failed:", error.message);
        marketingData = this._getFallbackMarketing();
      }

      this._updateProgress(100, "Complete!");
      await this._updateDatabaseProgress(100, "Complete!");

      // ✅ FIX: Use savedImages (the locally saved paths), not allImages
      const updateData = {
        status: "completed",
        progress: 100,
        pdfPath: filePath,
        coverImage: savedImages?.coverImage || null, // ✅ Fixed
        mockups: savedImages?.mockups || [], // ✅ Fixed - has { path, type, prompt }
        posters: savedImages?.posters || [], // ✅ Fixed - has { path, type, prompt }
        marketing: marketingData || this._getFallbackMarketing(),
      };

      await Product.findByIdAndUpdate(this.productId, updateData);

      console.log(`✅ Product ${this.productId} generation complete!`);
      return { success: true, filePath };
    } catch (error) {
      console.error(`❌ Generation failed:`, error.message);
      await Product.findByIdAndUpdate(this.productId, {
        status: "failed",
        error: error.message,
        progress: this.progress,
      });
      throw error;
    }
  }

  _updateProgress(progress, message) {
    this.progress = progress;
    console.log(`  📊 Progress: ${progress}% - ${message}`);
  }

  async _saveFile(buffer, type) {
    const projectRoot = path.join(__dirname, "../..");
    const fileDir = path.join(projectRoot, `uploads/${type}s`);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const extension = type === "pdf" ? "pdf" : "xlsx";
    const filename = `product_${this.productId}_${Date.now()}.${extension}`;

    const fullPath = path.join(fileDir, filename);
    fs.writeFileSync(fullPath, buffer);

    const relativePath = `uploads/${type}s/${filename}`;

    console.log(
      `  💾 File saved: ${relativePath} (${(buffer.length / 1024).toFixed(2)} KB)`,
    );

    return relativePath;
  }

  _getFallbackMarketing() {
    const { title, outcome } = this.productData;
    return {
      emails: [
        {
          type: "launch",
          subject: `🚀 Introducing ${title}`,
          body: `Dear Customer,\n\nI'm thrilled to announce the launch of ${title}!\n\nGet started today!`,
        },
        {
          type: "promotion",
          subject: `🎯 Special Offer: ${title}`,
          body: `Hi there,\n\nFor a limited time, get ${title} at a special price.\n\nDon't miss out!`,
        },
        {
          type: "followup",
          subject: `💡 How is ${title} working for you?`,
          body: `Hello,\n\nI hope you're enjoying ${title}.\n\nI'd love to hear about your progress!`,
        },
      ],
      social: [
        {
          platform: "instagram",
          content: `🚀 Introducing ${title}! Get started today. ✨`,
          hashtags: ["#productlaunch", "#success"],
        },
        {
          platform: "facebook",
          content: `Join thousands using ${title} to ${outcome}. Learn more now!`,
          hashtags: [],
        },
        {
          platform: "x",
          content: `🚀 Just launched ${title}! Transform your life today! #productlaunch`,
          hashtags: ["#productlaunch"],
        },
        {
          platform: "pinterest",
          content: `Transform your life with ${title}. ${outcome}. Perfect for beginners.`,
          hashtags: [],
        },
      ],
      ads: [
        {
          type: "headline",
          headline: `Transform Your Life with ${title}`,
          body: `Discover the secret to ${outcome}. Get started today!`,
          cta: "Get Started Now",
        },
        {
          type: "problem-solution",
          headline: `Ready for a change?`,
          body: `${title} is the solution you've been looking for.`,
          cta: "Learn More",
        },
        {
          type: "social-proof",
          headline: `Join Thousands of Happy Customers`,
          body: `See how ${title} helped others achieve ${outcome}.`,
          cta: "Join Now",
        },
      ],
      seo: {
        metaTitle: title,
        metaDescription: `Discover ${title}. Perfect for beginners.`,
        keywords: [title, "guide", "tutorial", "success"],
        blogIdeas: [
          `10 Reasons Why ${title} is the Best`,
          `How to Get Started with ${title}`,
          `The Ultimate Guide to Success`,
        ],
      },
    };
  }

  // backend/services/generation/generationService.js

  async _saveImages(imageResults, productId) {
    const savedImages = {
      coverImage: null,
      mockups: [],
      posters: [],
    };

    // ✅ Save cover image - pass "cover" as type
    if (imageResults.coverImage) {
      console.log("  📁 Saving cover image to covers folder...");
      savedImages.coverImage = await this._saveSingleImage(
        imageResults.coverImage,
        productId,
        "cover", // ← This must be "cover"
      );
    }

    // ✅ Save mockups - pass "mockup" as type
    for (let i = 0; i < imageResults.mockups.length; i++) {
      const mockup = imageResults.mockups[i];
      const path = await this._saveSingleImage(
        mockup.url,
        productId,
        `mockup_${i + 1}`,
      );
      if (path) {
        savedImages.mockups.push({
          path: path,
          type: mockup.type,
          prompt: mockup.prompt,
        });
      }
    }

    // ✅ Save posters - pass "poster" as type
    for (let i = 0; i < imageResults.posters.length; i++) {
      const poster = imageResults.posters[i];
      const path = await this._saveSingleImage(
        poster.url,
        productId,
        `poster_${i + 1}`,
      );
      if (path) {
        savedImages.posters.push({
          path: path,
          type: poster.type,
          prompt: poster.prompt,
        });
      }
    }

    return savedImages;
  }

  // backend/services/generation/generationService.js

  async _saveSingleImage(imageUrl, productId, type) {
    if (!imageUrl) return null;

    try {
      // ✅ Determine folder based on type
      let saveDir;
      let filename;
      let relativePath;

      if (
        type === "cover" ||
        type === "cover_image" ||
        type.startsWith("cover")
      ) {
        // ✅ Cover images go to covers folder
        saveDir = path.join(__dirname, "../../uploads/covers");
        filename = `cover_${productId}_${Date.now()}.png`;
        relativePath = `uploads/covers/${filename}`;
      } else {
        // ✅ Mockups and posters go to images folder
        saveDir = path.join(__dirname, "../../uploads/images");
        filename = `${type}_${productId}_${Date.now()}.png`;
        relativePath = `uploads/images/${filename}`;
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // Download image
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      const imageBuffer = Buffer.from(response.data);
      const filePath = path.join(saveDir, filename);
      fs.writeFileSync(filePath, imageBuffer);

      console.log(`  💾 Image saved: ${relativePath}`);
      return relativePath;
    } catch (error) {
      console.error(`❌ Failed to save ${type} image:`, error.message);
      return null;
    }
  }
}

module.exports = ProductGenerationService;
