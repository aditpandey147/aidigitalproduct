// backend/services/generation/htmlToPdfConverter.js
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

class HtmlToPdfConverter {
  constructor(productData, content, coverImagePath) {
    this.productData = productData;
    this.content = {
      chapters: content?.chapters || [],
      fullContent: content?.fullContent || "",
      outline: content?.outline || [],
      prompts: content?.prompts || [],
      items: content?.items || [],
      exercises: content?.exercises || [],
    };
    this.productType = productData.productType || "guide";
    this.coverImagePath = coverImagePath;
    // ✅ Store selected color palette for consistent use
    this.selectedPalette = null;
  }

  async convert() {
    console.log(`📄 Converting ${this.productType} to PDF...`);

    let coverImageBase64 = null;
    if (this.coverImagePath) {
      try {
        console.log("  🖼️ Loading cover image for PDF...");
        const imageBuffer = await this._loadImage(this.coverImagePath);
        coverImageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;
        console.log("  ✅ Cover image loaded for PDF");
      } catch (error) {
        console.warn("  ⚠️ Could not load cover image:", error.message);
      }
    }

    let fullHtml;

    switch (this.productType) {
      case "prompt-packs":
      case "prompt packs":
        fullHtml = this._buildPromptPackHtml(coverImageBase64);
        break;
      case "checklists":
      case "checklist":
        fullHtml = this._buildChecklistHtml(coverImageBase64);
        break;
      case "workbook":
      case "workbooks":
        fullHtml = this._buildWorkbookHtml(coverImageBase64);
        break;
      case "mini-courses":
      case "mini course":
        fullHtml = this._buildMiniCourseHtml(coverImageBase64);
        break;
      case "guide":
      case "guides":
      case "ebook":
      case "ebooks":
      case "planner":
      case "planners":
      case "challenges":
      case "challenge":
      case "templates":
      case "template":
      case "worksheets":
      case "worksheet":
      default:
        fullHtml = this._buildChapterHtml(coverImageBase64);
        break;
    }

    try {
      const htmlPath = path.join(
        __dirname,
        "../../uploads/temp",
        `product_${Date.now()}.html`,
      );
      const htmlDir = path.dirname(htmlPath);
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
      }
      fs.writeFileSync(htmlPath, fullHtml);
      console.log(`  📝 HTML saved: ${htmlPath}`);
    } catch (err) {
      // Ignore
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();

      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      await page.setContent(fullHtml, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "40px",
          bottom: "40px",
          left: "60px",
          right: "60px",
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true,
        timeout: 60000,
      });

      console.log(
        `  ✅ PDF generated: ${(pdfBuffer.length / 1024).toFixed(2)} KB`,
      );
      return pdfBuffer;
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // ================================================================
  // LOAD IMAGE FROM LOCAL PATH OR URL
  // ================================================================

  async _loadImage(pathOrUrl) {
    try {
      if (
        pathOrUrl &&
        !pathOrUrl.startsWith("http://") &&
        !pathOrUrl.startsWith("https://") &&
        !pathOrUrl.startsWith("data:")
      ) {
        const projectRoot = path.join(__dirname, "../..");
        const fullPath = path.join(projectRoot, pathOrUrl);
        console.log(`  📁 Reading local image: ${fullPath}`);

        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath);
          console.log(`  ✅ Local image loaded: ${imageBuffer.length} bytes`);
          return imageBuffer;
        } else {
          console.warn(`  ⚠️ Local image not found: ${fullPath}`);
          throw new Error(`Local image not found: ${pathOrUrl}`);
        }
      }

      console.log(`  📥 Downloading remote image...`);
      const response = await axios.get(pathOrUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      console.log(`  ✅ Downloaded: ${response.data.byteLength} bytes`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error("❌ Image load failed:", error.message);
      throw error;
    }
  }

  // ================================================================
  // GET NICHE COLORS
  // ================================================================

  _getNicheColors() {
    const { niche } = this.productData;
    console.log(`🎨 Generating random color for niche: "${niche}"`);

    // ✅ 20+ Beautiful Color Palettes
    const colorPalettes = [
      // Gold/Yellow Theme
      {
        name: "Gold",
        primary: "#FACC15",
        secondary: "#F59E0B",
        accent: "#111827",
        light: "#FFFBEB",
        topBar: "#FACC15",
      },
      // Deep Blue Theme
      {
        name: "Deep Blue",
        primary: "#1E3A5F",
        secondary: "#2E5A8A",
        accent: "#FACC15",
        light: "#E8F0FE",
        topBar: "#1E3A5F",
      },
      // Emerald Green Theme
      {
        name: "Emerald",
        primary: "#059669",
        secondary: "#10B981",
        accent: "#FFFFFF",
        light: "#D1FAE5",
        topBar: "#059669",
      },
      // Royal Purple Theme
      {
        name: "Royal Purple",
        primary: "#6D28D9",
        secondary: "#8B5CF6",
        accent: "#FFFFFF",
        light: "#EDE9FE",
        topBar: "#6D28D9",
      },
      // Rose Pink Theme
      {
        name: "Rose Pink",
        primary: "#BE185D",
        secondary: "#EC4899",
        accent: "#FFFFFF",
        light: "#FCE7F3",
        topBar: "#BE185D",
      },
      // Ocean Teal Theme
      {
        name: "Ocean Teal",
        primary: "#0D9488",
        secondary: "#14B8A6",
        accent: "#FFFFFF",
        light: "#CCFBF1",
        topBar: "#0D9488",
      },
      // Sunset Orange Theme
      {
        name: "Sunset Orange",
        primary: "#EA580C",
        secondary: "#F97316",
        accent: "#FFFFFF",
        light: "#FFF7ED",
        topBar: "#EA580C",
      },
      // Indigo Theme
      {
        name: "Indigo",
        primary: "#3730A3",
        secondary: "#6366F1",
        accent: "#FFFFFF",
        light: "#E0E7FF",
        topBar: "#3730A3",
      },
      // Crimson Red Theme
      {
        name: "Crimson",
        primary: "#B91C1C",
        secondary: "#EF4444",
        accent: "#FFFFFF",
        light: "#FEE2E2",
        topBar: "#B91C1C",
      },
      // Forest Green Theme
      {
        name: "Forest Green",
        primary: "#065F46",
        secondary: "#047857",
        accent: "#FACC15",
        light: "#D1FAE5",
        topBar: "#065F46",
      },
      // Midnight Blue Theme
      {
        name: "Midnight Blue",
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#FACC15",
        light: "#F1F5F9",
        topBar: "#0F172A",
      },
      // Coral Theme
      {
        name: "Coral",
        primary: "#DC2626",
        secondary: "#F87171",
        accent: "#FFFFFF",
        light: "#FEE2E2",
        topBar: "#DC2626",
      },
      // Amber Theme
      {
        name: "Amber",
        primary: "#D97706",
        secondary: "#F59E0B",
        accent: "#111827",
        light: "#FEF3C7",
        topBar: "#D97706",
      },
      // Violet Theme
      {
        name: "Violet",
        primary: "#7C3AED",
        secondary: "#A78BFA",
        accent: "#FFFFFF",
        light: "#EDE9FE",
        topBar: "#7C3AED",
      },
      // Slate Gray Theme
      {
        name: "Slate Gray",
        primary: "#334155",
        secondary: "#64748B",
        accent: "#FACC15",
        light: "#F1F5F9",
        topBar: "#334155",
      },
      // Warm Brown Theme
      {
        name: "Warm Brown",
        primary: "#78350F",
        secondary: "#B45309",
        accent: "#FACC15",
        light: "#FEF3C7",
        topBar: "#78350F",
      },
      // Cyan Theme
      {
        name: "Cyan",
        primary: "#0891B2",
        secondary: "#06B6D4",
        accent: "#FFFFFF",
        light: "#CFFAFE",
        topBar: "#0891B2",
      },
      // Magenta Theme
      {
        name: "Magenta",
        primary: "#B83280",
        secondary: "#D946EF",
        accent: "#FFFFFF",
        light: "#FDF2F8",
        topBar: "#B83280",
      },
      // Lime Green Theme
      {
        name: "Lime Green",
        primary: "#4D7C0F",
        secondary: "#65A30D",
        accent: "#FFFFFF",
        light: "#ECFCCB",
        topBar: "#4D7C0F",
      },
      // Navy Theme
      {
        name: "Navy",
        primary: "#1E2A4F",
        secondary: "#2D3B6F",
        accent: "#FACC15",
        light: "#E8EDF5",
        topBar: "#1E2A4F",
      },
      // Peach Theme
      {
        name: "Peach",
        primary: "#E07A5F",
        secondary: "#F2CC8F",
        accent: "#3D405B",
        light: "#FDF4F0",
        topBar: "#E07A5F",
      },
      // Mint Theme
      {
        name: "Mint",
        primary: "#2D6A4F",
        secondary: "#40916C",
        accent: "#FFFFFF",
        light: "#D8F3DC",
        topBar: "#2D6A4F",
      },
      // Ruby Theme
      {
        name: "Ruby",
        primary: "#9B1D20",
        secondary: "#C0392B",
        accent: "#FACC15",
        light: "#FDE8E8",
        topBar: "#9B1D20",
      },
    ];

    // ✅ Get random index
    const randomIndex = Math.floor(Math.random() * colorPalettes.length);
    const selectedPalette = colorPalettes[randomIndex];

    console.log(
      `🎨 Selected color: ${selectedPalette.name} (${randomIndex + 1}/${colorPalettes.length})`,
    );

    return {
      primary: selectedPalette.primary,
      secondary: selectedPalette.secondary,
      accent: selectedPalette.accent,
      light: selectedPalette.light,
      topBar: selectedPalette.topBar,
      name: selectedPalette.name,
    };
  }

  // ================================================================
  // BUILD COVER HTML WITH IMAGE
  // ================================================================

  _buildCoverHtml(coverImageBase64) {
    const { title, authorName, brandName, productType } = this.productData;
    const currentYear = new Date().getFullYear();
    const colors = this._getNicheColors();
    const typeLabel =
      productType.charAt(0).toUpperCase() + productType.slice(1);

    if (coverImageBase64) {
      return `
        <div class="cover-page cover-page--image">
          <img src="${coverImageBase64}" class="cover-image" />
          <div class="cover-scrim"></div>
          <div class="cover-content">
            <div class="cover-rule"></div>
            <div class="cover-eyebrow">${this._escapeHtml(typeLabel)}</div>
            <h1 class="cover-title">${this._escapeHtml(title.toUpperCase())}</h1>
            <div class="cover-divider"><span></span><i></i><span></span></div>
            <p class="cover-subtitle">A Comprehensive ${this._escapeHtml(typeLabel)}</p>
            ${authorName ? `<p class="cover-author">By ${this._escapeHtml(authorName)}</p>` : ""}
            ${brandName ? `<p class="cover-brand">${this._escapeHtml(brandName)}</p>` : ""}
            <div class="cover-rule"></div>
            <p class="cover-copyright">© ${currentYear} ${this._escapeHtml(brandName || authorName || "All Rights Reserved")}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="cover-page cover-page--gradient" style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);">
        <div class="cover-orb cover-orb--tr"></div>
        <div class="cover-orb cover-orb--bl"></div>
        <div class="cover-content">
          <div class="cover-rule"></div>
          <div class="cover-eyebrow">${this._escapeHtml(typeLabel)}</div>
          <h1 class="cover-title">${this._escapeHtml(title.toUpperCase())}</h1>
          <div class="cover-divider"><span></span><i></i><span></span></div>
          <p class="cover-subtitle">A Comprehensive ${this._escapeHtml(typeLabel)}</p>
          ${authorName ? `<p class="cover-author">By ${this._escapeHtml(authorName)}</p>` : ""}
          ${brandName ? `<p class="cover-brand">${this._escapeHtml(brandName)}</p>` : ""}
          <div class="cover-rule"></div>
          <p class="cover-copyright">© ${currentYear} ${this._escapeHtml(brandName || authorName || "All Rights Reserved")}</p>
        </div>
      </div>
    `;
  }

  // ================================================================
  // COMMON STYLES - CSS-VARIABLE DRIVEN DESIGN SYSTEM
  // ================================================================

  _getCommonStyles() {
    const colors = this._getNicheColors();

    return `
      :root {
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent || colors.primary};
        --color-light: ${colors.light || "#f1f5f9"};
        --color-topbar: ${colors.topBar || colors.primary};
        --font-serif: 'Georgia', 'Times New Roman', serif;
        --font-sans: 'Helvetica', 'Arial', sans-serif;
        --font-mono: 'Courier New', monospace;
        --space-xs: 6px;
        --space-sm: 12px;
        --space-md: 20px;
        --space-lg: 32px;
        --space-xl: 48px;
        --content-margin: 45px;
        --line-body: 1.85;
      }

      @page { margin: 0; size: A4; }
      @page cover { margin: 0; }
      @page content { margin: 40px 20px; }
      @page toc { margin: 50px 80px; }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

      body {
        font-family: var(--font-serif);
        font-size: 11pt;
        line-height: var(--line-body);
        color: #1a1a1a;
        background: #ffffff;
        width: 100%;
      }

      /* -------------------- Print quality control -------------------- */
      p, li, blockquote { orphans: 3; widows: 3; }
      .read-first-heading, .section-heading, .sub-heading,
      .module-title, .lesson-title, .page-header-bar {
        break-after: avoid;
        page-break-after: avoid;
      }
      .exercise-box, .reflection-box, .prompt-item, .checklist-item,
      .blockquote, .quiz-section, .assignment-section, .chapter-number-badge {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* -------------------- Cover -------------------- */
      .cover-page {
        page: cover;
        page-break-after: always;
        height: 100vh;
        width: 100%;
        position: relative;
        overflow: hidden;
        font-family: var(--font-serif);
      }
      .cover-page--image .cover-image {
        position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: cover; z-index: 1;
      }
      .cover-page--image .cover-scrim {
        position: absolute; inset: 0; z-index: 2;
        background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%);
      }
      .cover-orb { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); filter: blur(20px); }
      .cover-orb--tr { width: 600px; height: 600px; top: -200px; right: -200px; }
      .cover-orb--bl { width: 500px; height: 500px; bottom: -150px; left: -150px; }
      .cover-content {
        position: relative; z-index: 3; height: 100vh;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; color: #ffffff; padding: 0 60px; max-width: 820px; margin: 0 auto;
      }
      .cover-rule { width: 80px; height: 2px; background: var(--color-accent); margin: 0 auto var(--space-lg); opacity: 0.65; }
      .cover-eyebrow {
        display: inline-block; background: rgba(255,255,255,0.14); padding: 6px 22px; border-radius: 20px;
        font-size: 10.5pt; letter-spacing: 3px; text-transform: uppercase; font-family: var(--font-sans);
        margin-bottom: var(--space-lg); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.12);
      }
      .cover-title {
        font-size: 46pt; font-weight: bold; letter-spacing: 3px; line-height: 1.18;
        text-shadow: 0 4px 30px rgba(0,0,0,0.35); margin-bottom: var(--space-md);
      }
      .cover-divider { display: flex; align-items: center; justify-content: center; gap: 15px; margin: var(--space-lg) auto; width: 200px; }
      .cover-divider span { flex: 1; height: 1px; background: rgba(255,255,255,0.3); }
      .cover-divider i { width: 8px; height: 8px; background: var(--color-accent); transform: rotate(45deg); opacity: 0.85; }
      .cover-subtitle { font-size: 18pt; color: rgba(255,255,255,0.9); font-style: italic; letter-spacing: 1.5px; margin-bottom: var(--space-lg); }
      .cover-author { font-size: 15pt; color: rgba(255,255,255,0.95); margin-top: var(--space-sm); }
      .cover-brand { font-size: 12pt; color: rgba(255,255,255,0.7); font-style: italic; margin-top: 4px; }
      .cover-copyright { font-size: 9pt; color: rgba(255,255,255,0.45); font-family: var(--font-sans); letter-spacing: 1px; margin-top: var(--space-md); }

      /* -------------------- Shared page chrome -------------------- */
      .page-wrapper { position: relative; }
      .top-bar { background: var(--color-topbar); height: 10px; width: 100%; }
      .top-bar-accent { background: var(--color-accent); height: 2px; width: 100%; }

      .page-header-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: var(--space-md);
      }
      .page-header-title { font-size: 9pt; color: #333; font-family: var(--font-sans); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
      .page-header-badge {
        font-size: 8pt; color: var(--color-primary); font-family: var(--font-sans); font-weight: bold;
        letter-spacing: 1px; text-transform: uppercase; background: var(--color-light);
        padding: 3px 12px; border-radius: 12px; border: 1px solid var(--color-primary); opacity: 0.75;
      }

      .content-page, .chapter, .module-section {
        page: content; page-break-after: always; background: #ffffff; width: 100%; max-width: 100%; overflow: hidden;
      }
      .content-page:last-child, .chapter:last-child, .module-section:last-child { page-break-after: avoid; }
      .content-inner { padding: var(--space-md) var(--content-margin) 40px; max-width: 100%; overflow: hidden; }
      .chapter-content { width: 100%; max-width: 100%; overflow: hidden; word-wrap: break-word; }

      /* Chapter number badge for visual hierarchy */
      .chapter-number-badge {
        display: inline-flex; align-items: center; justify-content: center;
        width: 38px; height: 38px; border-radius: 50%; margin-bottom: var(--space-sm);
        background: var(--color-light); color: var(--color-primary);
        font-family: var(--font-sans); font-weight: bold; font-size: 13pt;
        border: 2px solid var(--color-primary);
      }

      /* -------------------- Table of contents -------------------- */
      .toc-page { page: toc; page-break-after: always; }
      .toc-title {
        font-size: 22pt; font-weight: bold; text-align: center; margin-bottom: var(--space-lg);
        color: var(--color-primary); letter-spacing: 4px; position: relative; padding-bottom: var(--space-sm);
      }
      .toc-title::after {
        content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 80px; height: 2px; background: linear-gradient(to right, transparent, var(--color-primary), transparent);
      }
      .toc-item { display: flex; align-items: baseline; gap: 8px; padding: 9px 0; font-size: 11pt; color: #333; }
      .toc-item-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
      .toc-dots { flex: 1; border-bottom: 1px dotted #cfcfcf; height: 0; margin-bottom: 5px; }
      .toc-item-page {
        color: var(--color-primary); font-weight: bold; font-size: 10pt;
        background: var(--color-light); padding: 1px 10px; border-radius: 12px; flex-shrink: 0;
      }

      /* -------------------- Typography -------------------- */
      .content-text {
        word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;
        margin-bottom: var(--space-sm); text-align: justify; font-size: 11pt; line-height: var(--line-body); color: #2a2a2a;
      }
      .read-first-heading, .section-heading {
        font-size: 20pt; font-weight: bold; color: var(--color-primary);
        margin-bottom: var(--space-sm); line-height: 1.3; letter-spacing: -0.3px; word-wrap: break-word;
      }
      .sub-heading {
        font-size: 14pt; font-weight: bold; color: var(--color-secondary);
        margin: var(--space-lg) 0 var(--space-xs); line-height: 1.4; word-wrap: break-word;
      }
      .content-list { margin: var(--space-xs) 0 var(--space-sm) 25px; font-size: 11pt; color: #2a2a2a; line-height: var(--line-body); }
      .content-list li { margin-bottom: 5px; padding-left: 5px; word-wrap: break-word; }
      .content-list li::marker { color: var(--color-primary); opacity: 0.65; }

      .blockquote {
        margin: var(--space-md) 0; padding: var(--space-sm) 25px; background: var(--color-light);
        border-left: 4px solid var(--color-primary); font-style: italic; color: #444;
        font-size: 12pt; line-height: 1.8; border-radius: 0 8px 8px 0; word-wrap: break-word;
      }
      .content-divider { width: 60px; height: 1px; background: var(--color-primary); margin: var(--space-md) 0; opacity: 0.3; }

      /* -------------------- Footer / running page number -------------------- */
      .page-footer {
        display: flex; justify-content: space-between; align-items: baseline;
        padding-top: var(--space-md); border-top: 1px solid #efefef; margin-top: var(--space-lg);
      }
      .page-footer-brand { font-size: 8pt; color: #bbb; letter-spacing: 1px; font-family: var(--font-sans); text-transform: uppercase; }
      .page-footer-number { font-size: 9pt; color: #ccc; letter-spacing: 1px; }

      /* -------------------- Boxes -------------------- */
      .exercise-box, .reflection-box, .quiz-section, .assignment-section {
        background: var(--color-light); padding: var(--space-sm) 20px; border-radius: 8px;
        margin: var(--space-sm) 0; border-left: 4px solid var(--color-primary); word-wrap: break-word;
      }
      .reflection-box { background: #f0f4f8; border-left-color: #4a90d9; }
      .exercise-box-title, .reflection-box-title { font-weight: bold; font-size: 13pt; margin-bottom: var(--space-xs); color: #1a1a1a; }
      .exercise-box-item, .reflection-item { padding: 6px 0; border-bottom: 1px dashed #e5e7eb; font-size: 11pt; }
      .exercise-box-item:last-child, .reflection-item:last-child { border-bottom: none; }

      .prompt-item { margin-bottom: var(--space-sm); padding: var(--space-sm) 20px; background: var(--color-light); border-radius: 8px; border-left: 3px solid var(--color-primary); word-wrap: break-word; }
      .prompt-title { font-size: 13pt; font-weight: bold; margin-bottom: var(--space-xs); color: #1a1a1a; }
      .prompt-text { font-size: 10pt; color: #333; line-height: 1.7; font-family: var(--font-mono); background: #ffffff; padding: 10px 14px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #e5e7eb; }
      .prompt-category-count { font-size: 10pt; color: #999; font-style: italic; margin-bottom: var(--space-sm); }

      .checklist-item { padding: var(--space-xs) 0; border-bottom: 1px solid #f0f0f0; font-size: 11pt; display: flex; align-items: flex-start; gap: 12px; line-height: 1.6; }
      .checklist-item:last-child { border-bottom: none; }
      .checkbox { width: 16px; height: 16px; border: 2px solid var(--color-primary); border-radius: 4px; flex-shrink: 0; margin-top: 2px; background: #ffffff; }

      .module-title {
        font-size: 24pt; font-weight: bold; color: var(--color-primary); margin-bottom: var(--space-sm);
        border-bottom: 2px solid var(--color-light); padding-bottom: var(--space-sm); word-wrap: break-word;
      }
      .lesson-title { font-size: 18pt; font-weight: bold; color: var(--color-secondary); margin: var(--space-lg) 0 var(--space-sm); padding-left: var(--space-sm); border-left: 3px solid var(--color-primary); word-wrap: break-word; }
      .lesson-content { font-size: 11pt; line-height: var(--line-body); color: #333; padding-left: var(--space-md); word-wrap: break-word; }
      .quiz-section h3, .assignment-section h3 { color: var(--color-primary); font-size: 13pt; margin-bottom: var(--space-xs); }
      .question-item { margin: var(--space-xs) 0; padding: 8px 12px; background: white; border-radius: 4px; font-size: 10pt; color: #555; }

      @media print {
        .cover-page { page: cover; }
        .toc-page { page: toc; }
        .chapter, .content-page, .module-section { page: content; }
        body { background: white; }
      }
    `;
  }

  // ================================================================
  // TOC ROW HELPER (shared across all builders)
  // ================================================================

  _tocRow(title, pageNum) {
    return `
      <div class="toc-item">
        <span class="toc-item-title">${this._escapeHtml(title)}</span>
        <span class="toc-dots"></span>
        <span class="toc-item-page">${pageNum}</span>
      </div>
    `;
  }

  _pageFooter(pageNum) {
    const { brandName } = this.productData;
    return `
      <div class="page-footer">
        <span class="page-footer-brand">${brandName ? this._escapeHtml(brandName) : ""}</span>
        <span class="page-footer-number">${pageNum}</span>
      </div>
    `;
  }

  // ================================================================
  // BUILD CHAPTER HTML
  // ================================================================

  _buildChapterHtml(coverImageBase64) {
    const { title } = this.productData;
    let chapters = this.content.chapters || [];

    if (chapters.length === 0 && this.content.fullContent) {
      chapters = this._parseChaptersFromContent(this.content.fullContent);
    }

    if (chapters.length === 0) {
      chapters = [
        {
          title: "Content",
          content: this.content.fullContent || "No content available.",
        },
      ];
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)}</title>
  <style>${this._getCommonStyles()}</style>
</head>
<body>
  ${this._buildCoverHtml(coverImageBase64)}

  <div class="toc-page page-wrapper">
    <div class="top-bar"></div>
    <div class="top-bar-accent"></div>
    <div class="content-inner">
      <h1 class="toc-title">Contents</h1>
      ${this._tocRow("Cover Page", 1)}
      ${this._tocRow("Contents", 2)}
      ${chapters.map((ch, i) => this._tocRow(ch.title, i + 3)).join("")}
    </div>
  </div>

  ${chapters
    .map(
      (chapter, index) => `
    <div class="chapter page-wrapper">
      <div class="top-bar"></div>
      <div class="top-bar-accent"></div>
      <div class="content-inner">
        <div class="chapter-number-badge">${String(index + 1).padStart(2, "0")}</div>
        ${
          index === 0
            ? `<h1 class="read-first-heading">${this._escapeHtml(chapter.title)}</h1>`
            : `<h1 class="section-heading">${this._escapeHtml(chapter.title)}</h1>`
        }
        <div class="chapter-content">
          ${this._formatContent(chapter.content)}
        </div>
        ${this._pageFooter(index + 3)}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
  }

  // backend/services/generation/htmlToPdfConverter.js

  // ================================================================
  // FORMAT CONTENT - WITH BOLD SUPPORT
  // ================================================================

  _formatContent(content) {
    if (!content) return "<p class='content-text'>No content available.</p>";

    const paragraphs = content.split("\n\n");
    let html = "";

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check for divider
      if (trimmed === "---" || trimmed === "—") {
        html += `<div class="content-divider"></div>`;
        continue;
      }

      // ✅ Check for bold text with **
      if (trimmed.includes("**")) {
        // Split by ** and wrap with <strong>
        let formattedText = this._formatBoldText(trimmed);

        // Check if it's a heading (starts with ##)
        if (trimmed.startsWith("## ")) {
          const title = trimmed.replace(/^##\s*/, "");
          html += `<h2 class="sub-heading">${this._formatBoldText(title)}</h2>`;
          continue;
        }

        // Check if it's a bullet list
        if (trimmed.includes("\n• ") || trimmed.includes("\n- ")) {
          const items = trimmed.split("\n").filter((line) => {
            const t = line.trim();
            return t.startsWith("•") || t.startsWith("-");
          });
          if (items.length > 1) {
            html += '<ul class="content-list">';
            for (const item of items) {
              const text = item.replace(/^[•\-]\s*/, "").trim();
              html += `<li>${this._formatBoldText(text)}</li>`;
            }
            html += "</ul>";
            continue;
          }
        }

        // Check if it's a numbered list
        if (trimmed.match(/^\d+\./)) {
          const items = trimmed
            .split("\n")
            .filter((line) => line.trim().match(/^\d+\./));
          if (items.length > 1) {
            html += '<ol class="content-list">';
            for (const item of items) {
              const text = item.replace(/^\d+\.\s*/, "").trim();
              html += `<li>${this._formatBoldText(text)}</li>`;
            }
            html += "</ol>";
            continue;
          }
        }

        // Regular paragraph with bold text
        html += `<p class="content-text">${this._formatBoldText(trimmed)}</p>`;
        continue;
      }

      // Check for bullet list (no bold)
      if (trimmed.includes("\n• ") || trimmed.includes("\n- ")) {
        const items = trimmed.split("\n").filter((line) => {
          const t = line.trim();
          return t.startsWith("•") || t.startsWith("-");
        });
        if (items.length > 1) {
          html += '<ul class="content-list">';
          for (const item of items) {
            const text = item.replace(/^[•\-]\s*/, "").trim();
            html += `<li>${this._escapeHtml(text)}</li>`;
          }
          html += "</ul>";
          continue;
        }
      }

      // Check for numbered list (no bold)
      if (trimmed.match(/^\d+\./)) {
        const items = trimmed
          .split("\n")
          .filter((line) => line.trim().match(/^\d+\./));
        if (items.length > 1) {
          html += '<ol class="content-list">';
          for (const item of items) {
            const text = item.replace(/^\d+\.\s*/, "").trim();
            html += `<li>${this._escapeHtml(text)}</li>`;
          }
          html += "</ol>";
          continue;
        }
      }

      // Check for heading (## )
      if (trimmed.startsWith("## ")) {
        const title = trimmed.replace(/^##\s*/, "");
        html += `<h2 class="sub-heading">${this._escapeHtml(title)}</h2>`;
        continue;
      }

      // Regular paragraph
      html += `<p class="content-text">${this._escapeHtml(trimmed)}</p>`;
    }

    return html;
  }

  // ================================================================
  // FORMAT BOLD TEXT - NEW METHOD
  // ================================================================

  _formatBoldText(text) {
    if (!text) return "";

    // Split by ** and wrap with <strong>
    const parts = text.split(/\*\*(.*?)\*\*/g);
    let result = "";

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // This is content between ** ** (bold)
        result += `<strong>${this._escapeHtml(parts[i])}</strong>`;
      } else {
        // This is regular text
        result += this._escapeHtml(parts[i]);
      }
    }

    return result;
  }

  // ================================================================
  // BUILD WORKBOOK HTML
  // ================================================================

  _buildWorkbookHtml(coverImageBase64) {
    const { title } = this.productData;
    const exercises = this.content.exercises || [];

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)} - Workbook</title>
  <style>${this._getCommonStyles()}</style>
</head>
<body>
  ${this._buildCoverHtml(coverImageBase64)}
  <div class="toc-page page-wrapper">
    <div class="content-inner">
      <h1 class="toc-title">Table of Contents</h1>
      ${this._tocRow("Cover Page", 1)}
      ${this._tocRow("Table of Contents", 2)}
      ${exercises.map((s, i) => this._tocRow(`Section ${i + 1}: ${s.title}`, i + 3)).join("")}
    </div>
  </div>
  ${exercises
    .map(
      (section, index) => `
    <div class="content-page page-wrapper">
      <div class="top-bar"></div>
      <div class="top-bar-accent"></div>
      <div class="content-inner">
        <div class="page-header-bar">
          <span class="page-header-title">${this._escapeHtml(section.title)}</span>
          <span class="page-header-badge">SECTION ${index + 1}</span>
        </div>
        <h1 class="section-heading">${this._escapeHtml(section.title)}</h1>
        <div class="chapter-content">
          <p class="content-text">${this._escapeHtml(section.content)}</p>
        </div>
        ${
          section.exercises?.length > 0
            ? `
          <div class="exercise-box">
            <div class="exercise-box-title">📝 Exercises</div>
            ${section.exercises.map((ex) => `<div class="exercise-box-item">• ${this._escapeHtml(ex)}</div>`).join("")}
          </div>`
            : ""
        }
        ${
          section.reflection?.length > 0
            ? `
          <div class="reflection-box">
            <div class="reflection-box-title">💭 Reflection Questions</div>
            ${section.reflection.map((q) => `<div class="reflection-item">• ${this._escapeHtml(q)}</div>`).join("")}
          </div>`
            : ""
        }
        ${this._pageFooter(index + 3)}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
  }

  // ================================================================
  // BUILD PROMPT PACK HTML
  // ================================================================

  _buildPromptPackHtml(coverImageBase64) {
    const { title } = this.productData;
    const prompts = this.content.prompts || [];

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)} - Prompt Pack</title>
  <style>${this._getCommonStyles()}</style>
</head>
<body>
  ${this._buildCoverHtml(coverImageBase64)}
  <div class="toc-page page-wrapper">
    <div class="content-inner">
      <h1 class="toc-title">Prompt Categories</h1>
      ${this._tocRow("Cover Page", 1)}
      ${this._tocRow("Table of Contents", 2)}
      ${prompts.map((c, i) => this._tocRow(`${i + 1}. ${c.category}`, i + 3)).join("")}
    </div>
  </div>
  ${prompts
    .map(
      (category, index) => `
    <div class="content-page page-wrapper">
      <div class="top-bar"></div>
      <div class="top-bar-accent"></div>
      <div class="content-inner">
        <div class="page-header-bar">
          <span class="page-header-title">${this._escapeHtml(category.category)}</span>
          <span class="page-header-badge">CATEGORY ${index + 1}</span>
        </div>
        <h1 class="section-heading">${this._escapeHtml(category.category)}</h1>
        <p class="prompt-category-count">${category.prompts?.length || 0} prompts</p>
        ${(category.prompts || [])
          .map(
            (prompt) => `
          <div class="prompt-item">
            <div class="prompt-title">${this._escapeHtml(prompt.title)}</div>
            <div class="prompt-text">${this._escapeHtml(prompt.prompt)}</div>
          </div>`,
          )
          .join("")}
        ${this._pageFooter(index + 3)}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
  }

  // ================================================================
  // BUILD CHECKLIST HTML
  // ================================================================

  _buildChecklistHtml(coverImageBase64) {
    const { title } = this.productData;
    const items = this.content.items || [];

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)} - Checklist</title>
  <style>${this._getCommonStyles()}</style>
</head>
<body>
  ${this._buildCoverHtml(coverImageBase64)}
  ${items
    .map(
      (category, index) => `
    <div class="content-page page-wrapper">
      <div class="top-bar"></div>
      <div class="top-bar-accent"></div>
      <div class="content-inner">
        <div class="page-header-bar">
          <span class="page-header-title">${this._escapeHtml(category.category)}</span>
          <span class="page-header-badge">CATEGORY ${index + 1}</span>
        </div>
        <h1 class="section-heading">${this._escapeHtml(category.category)}</h1>
        ${(category.items || [])
          .map(
            (item) => `
          <div class="checklist-item">
            <span class="checkbox"></span>
            <span>${this._escapeHtml(item)}</span>
          </div>`,
          )
          .join("")}
        ${this._pageFooter(index + 2)}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
  }

  // ================================================================
  // BUILD MINI COURSE HTML
  // ================================================================

  _buildMiniCourseHtml(coverImageBase64) {
    const { title } = this.productData;
    let chapters = this.content.chapters || [];

    if (chapters.length === 0 && this.content.fullContent) {
      chapters = this._parseChaptersFromContent(this.content.fullContent);
    }

    if (chapters.length === 0) {
      chapters = [
        {
          title: "Course Content",
          content: this.content.fullContent || "No content available.",
        },
      ];
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)} - Mini Course</title>
  <style>${this._getCommonStyles()}</style>
</head>
<body>
  ${this._buildCoverHtml(coverImageBase64)}

  <div class="toc-page page-wrapper">
    <div class="content-inner">
      <h1 class="toc-title">Course Contents</h1>
      ${this._tocRow("Cover Page", 1)}
      ${this._tocRow("Table of Contents", 2)}
      ${chapters
        .map((chapter, index) => {
          const isModule = chapter.title.startsWith("Module");
          const isLesson = chapter.title.startsWith("Lesson");
          const prefix = isModule ? "📚 " : isLesson ? "↳ " : "📖 ";
          return this._tocRow(`${prefix}${chapter.title}`, index + 3);
        })
        .join("")}
    </div>
  </div>

  ${chapters
    .map((chapter, index) => {
      const isModule = chapter.title.startsWith("Module");
      const isLesson = chapter.title.startsWith("Lesson");
      const isQuiz = chapter.title.includes("Quiz");
      const isAssignment = chapter.title.includes("Assignment");

      let className = "chapter";
      let titleClass = "chapter-title";
      let contentClass = "chapter-content";

      if (isModule) {
        className = "module-section";
        titleClass = "module-title";
      } else if (isLesson) {
        titleClass = "lesson-title";
        contentClass = "lesson-content";
      }

      let badge = "";
      if (isModule) badge = "📚 ";
      else if (isLesson) badge = "📖 ";
      else if (isQuiz) badge = "📝 ";
      else if (isAssignment) badge = "📋 ";

      return `
      <div class="${className} page-wrapper">
        <div class="top-bar"></div>
        <div class="top-bar-accent"></div>
        <div class="content-inner">
          <div class="page-header-bar">
            <span class="page-header-title">${this._escapeHtml(chapter.title)}</span>
            <span class="page-header-badge">${index === 0 ? "START HERE" : `PART ${index + 1}`}</span>
          </div>
          <div class="${titleClass}">${badge}${this._escapeHtml(chapter.title)}</div>
          <div class="${contentClass}">
            ${this._formatContent(chapter.content)}
          </div>
          ${this._pageFooter(index + 3)}
        </div>
      </div>
    `;
    })
    .join("")}
</body>
</html>`;
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  _parseChaptersFromContent(fullContent) {
    const chapters = [];
    const lines = fullContent.split("\n");
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ") && trimmed.length > 3) {
        if (currentChapter) {
          currentChapter.content = currentContent.join("\n").trim();
          if (currentChapter.content) chapters.push(currentChapter);
        }
        const title = trimmed.substring(3).trim();
        currentChapter = { title, content: "" };
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

  _escapeHtml(text) {
    if (!text) return "";
    if (typeof text !== "string") return String(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, " ")
      .replace(/\r/g, "");
  }
}

module.exports = HtmlToPdfConverter;
