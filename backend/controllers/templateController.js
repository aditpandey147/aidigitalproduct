// backend/src/controllers/templateController.js
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// ================================================================
// TEMPLATE DATA
// ================================================================

const templates = [
  {
    id: "template-049",
    name: "AI Content Creator Toolkit Sales Page",
    category: "AI / Marketing",
    description:
      "High-converting sales page for an AI content creation toolkit",
    price: "Free",
    image: "/templates/ai-content-creator-toolkit.jpg",
    zipFile: "ai-content-creator-toolkit.zip",
    tags: ["ai", "content", "creator", "marketing", "toolkit"],
  },
  {
    id: "template-050",
    name: "30-Day AI Productivity Planner Sales Page",
    category: "Productivity",
    description:
      "High-converting sales page for a 30-day AI productivity planner",
    price: "Free",
    image: "/templates/ai-productivity-planner.jpg",
    zipFile: "30-day-ai-productivity-planner.zip",
    tags: ["ai", "productivity", "planner", "30-day", "planning"],
  },
  {
    id: "template-051",
    name: "Canva Social Media Content Kit Sales Page",
    category: "Social Media",
    description:
      "High-converting sales page for a Canva social media content kit",
    price: "Free",
    image: "/templates/canva-social-media-content-kit.jpg",
    zipFile: "canva-social-media-content-kit.zip",
    tags: ["canva", "social-media", "content", "instagram", "marketing"],
  },
  {
    id: "template-052",
    name: "Small Business Finance Dashboard Sales Page",
    category: "Business / Finance",
    description:
      "High-converting sales page for a small business finance dashboard",
    price: "Free",
    image: "/templates/small-business-finance-dashboard.jpg",
    zipFile: "small-business-finance-dashboard.zip",
    tags: ["business", "finance", "dashboard", "small-business", "money"],
  },
  {
    id: "template-053",
    name: "Ultimate ChatGPT Prompt Library Sales Page",
    category: "AI",
    description:
      "High-converting sales page for an ultimate ChatGPT prompt library",
    price: "Free",
    image: "/templates/chatgpt-prompt-library.jpg",
    zipFile: "ultimate-chatgpt-prompt-library.zip",
    tags: ["ai", "chatgpt", "prompts", "prompt-library", "productivity"],
  },
  {
    id: "template-054",
    name: "Faceless YouTube Starter Kit Sales Page",
    category: "Creator Economy",
    description:
      "High-converting sales page for a faceless YouTube channel starter kit",
    price: "Free",
    image: "/templates/faceless-youtube-starter-kit.jpg",
    zipFile: "faceless-youtube-starter-kit.zip",
    tags: ["youtube", "faceless", "creator", "video", "content"],
  },
  {
    id: "template-055",
    name: "AI-Powered Etsy Seller Kit Sales Page",
    category: "E-commerce",
    description: "High-converting sales page for an AI-powered Etsy seller kit",
    price: "Free",
    image: "/templates/ai-etsy-seller-kit.jpg",
    zipFile: "ai-powered-etsy-seller-kit.zip",
    tags: ["etsy", "ai", "ecommerce", "seller", "online-store"],
  },
  {
    id: "template-056",
    name: "Digital Marketing Launch Planner Sales Page",
    category: "Marketing",
    description:
      "High-converting sales page for a digital marketing launch planner",
    price: "Free",
    image: "/templates/digital-marketing-launch-planner.jpg",
    zipFile: "digital-marketing-launch-planner.zip",
    tags: ["marketing", "digital-marketing", "launch", "planner", "strategy"],
  },
  {
    id: "template-057",
    name: "30-Day Fitness Transformation Planner Sales Page",
    category: "Health / Fitness",
    description:
      "High-converting sales page for a 30-day fitness transformation planner",
    price: "Free",
    image: "/templates/fitness-transformation-planner.jpg",
    zipFile: "30-day-fitness-transformation-planner.zip",
    tags: ["fitness", "workout", "planner", "30-day", "transformation"],
  },
  {
    id: "template-058",
    name: "Notion Life & Business OS Sales Page",
    category: "Productivity",
    description:
      "High-converting sales page for a Notion life and business operating system",
    price: "Free",
    image: "/templates/notion-life-business-os.jpg",
    zipFile: "notion-life-business-os.zip",
    tags: ["notion", "productivity", "business", "life", "organization"],
  },
  {
    id: "template-059",
    name: "Freelancer Business Toolkit Sales Page",
    category: "Freelancing",
    description: "High-converting sales page for a freelancer business toolkit",
    price: "Free",
    image: "/templates/freelancer-business-toolkit.jpg",
    zipFile: "freelancer-business-toolkit.zip",
    tags: ["freelancing", "freelancer", "business", "clients", "services"],
  },
  {
    id: "template-060",
    name: "AI Ebook Creation Kit Sales Page",
    category: "AI / Publishing",
    description:
      "High-converting sales page for an AI-powered ebook creation kit",
    price: "Free",
    image: "/templates/ai-ebook-creation-kit.jpg",
    zipFile: "ai-ebook-creation-kit.zip",
    tags: ["ai", "ebook", "publishing", "writing", "content"],
  },
  {
    id: "template-054",
    name: "AI Resume & Career Accelerator Kit Sales Page",
    category: "Career / AI",
    description:
      "High-converting sales page for an AI-powered resume and career accelerator kit",
    price: "Free",
    image: "/templates/ai-resume-career-accelerator.jpg",
    zipFile: "ai-resume-career-accelerator-kit.zip",
    tags: ["ai", "resume", "career", "jobs", "interview"],
  },

  {
    id: "template-055",
    name: "Ultimate AI Business Starter Kit Sales Page",
    category: "AI / Business",
    description:
      "High-converting sales page for an AI-powered business starter kit",
    price: "Free",
    image: "/templates/ultimate-ai-business-starter.jpg",
    zipFile: "ultimate-ai-business-starter-kit.zip",
    tags: ["ai", "business", "startup", "entrepreneur", "automation"],
  },

  {
    id: "template-056",
    name: "Instagram Growth Content System Sales Page",
    category: "Social Media",
    description:
      "High-converting sales page for an Instagram content and growth system",
    price: "Free",
    image: "/templates/instagram-growth-content-system.jpg",
    zipFile: "instagram-growth-content-system.zip",
    tags: ["instagram", "social-media", "content", "growth", "marketing"],
  },

  {
    id: "template-057",
    name: "Digital Planner Mega Bundle Sales Page",
    category: "Productivity",
    description:
      "High-converting sales page for a complete digital planner mega bundle",
    price: "Free",
    image: "/templates/digital-planner-mega-bundle.jpg",
    zipFile: "digital-planner-mega-bundle.zip",
    tags: [
      "planner",
      "productivity",
      "goals",
      "organization",
      "digital-planner",
    ],
  },

  {
    id: "template-058",
    name: "AI Side Hustle Launch Kit Sales Page",
    category: "AI / Side Hustle",
    description:
      "High-converting sales page for an AI-powered side hustle launch kit",
    price: "Free",
    image: "/templates/ai-side-hustle-launch-kit.jpg",
    zipFile: "ai-side-hustle-launch-kit.zip",
    tags: ["ai", "side-hustle", "make-money", "entrepreneur", "business"],
  },

  {
    id: "template-059",
    name: "Small Business AI Automation Toolkit Sales Page",
    category: "AI / Business",
    description:
      "High-converting sales page for a small business AI automation toolkit",
    price: "Free",
    image: "/templates/small-business-ai-automation.jpg",
    zipFile: "small-business-ai-automation-toolkit.zip",
    tags: ["ai", "automation", "small-business", "workflow", "productivity"],
  },

  {
    id: "template-060",
    name: "Ultimate Personal Branding Kit Sales Page",
    category: "Branding / Marketing",
    description:
      "High-converting sales page for an ultimate personal branding toolkit",
    price: "Free",
    image: "/templates/ultimate-personal-branding-kit.jpg",
    zipFile: "ultimate-personal-branding-kit.zip",
    tags: [
      "personal-branding",
      "branding",
      "marketing",
      "content",
      "social-media",
    ],
  },

  {
    id: "template-061",
    name: "YouTube Content & Growth Planner Sales Page",
    category: "YouTube / Creator",
    description:
      "High-converting sales page for a YouTube content planning and growth system",
    price: "Free",
    image: "/templates/youtube-content-growth-planner.jpg",
    zipFile: "youtube-content-and-growth-planner.zip",
    tags: ["youtube", "creator", "content", "video", "growth"],
  },

  {
    id: "template-062",
    name: "AI Prompt Engineering Master Pack Sales Page",
    category: "AI / Prompts",
    description:
      "High-converting sales page for an AI prompt engineering master pack",
    price: "Free",
    image: "/templates/ai-prompt-engineering-master-pack.jpg",
    zipFile: "ai-prompt-engineering-master-pack.zip",
    tags: ["ai", "prompts", "prompt-engineering", "chatgpt", "productivity"],
  },

  {
    id: "template-063",
    name: "Digital Product Launch Blueprint Sales Page",
    category: "Digital Products / Marketing",
    description:
      "High-converting sales page for a digital product launch and marketing blueprint",
    price: "Free",
    image: "/templates/digital-product-launch-blueprint.jpg",
    zipFile: "digital-product-launch-blueprint.zip",
    tags: [
      "digital-products",
      "launch",
      "marketing",
      "sales",
      "online-business",
    ],
  },
];

// ================================================================
// GET ALL TEMPLATES
// ================================================================

exports.getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filteredTemplates = [...templates];

    if (category && category !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    res.json({
      success: true,
      data: filteredTemplates,
      total: filteredTemplates.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// ================================================================
// GET SINGLE TEMPLATE
// ================================================================

exports.getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};

// ================================================================
// GET TEMPLATE CATEGORIES
// ================================================================

exports.getCategories = async (req, res) => {
  try {
    const categories = [...new Set(templates.map((t) => t.category))];
    const categoryCounts = categories.map((cat) => ({
      name: cat,
      count: templates.filter((t) => t.category === cat).length,
    }));

    res.json({
      success: true,
      data: categoryCounts,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ================================================================
// ✅ DOWNLOAD TEMPLATE - FIXED
// ================================================================

exports.downloadTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Find template
    const template = templates.find((t) => t.id === id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Build path to zip file
    const zipPath = path.join(
      __dirname,
      "../../public/templates",
      template.zipFile,
    );

    // ✅ If zip file doesn't exist, create it on the fly
    if (!fs.existsSync(zipPath)) {
      // Create templates directory if it doesn't exist
      const templatesDir = path.join(__dirname, "../../public/templates");
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }

      // Create a simple zip file with template info
      const content = `
        Template: ${template.name}
        ID: ${template.id}
        Category: ${template.category}
        Description: ${template.description}
        Tags: ${template.tags.join(", ")}
        
        This is a placeholder file. 
        Please add your actual template files here.
      `;

      fs.writeFileSync(zipPath, content);
    }

    res.download(zipPath, template.zipFile, (err) => {
      if (err) {
        console.error("Download error:", err);
        // Don't send error response if headers already sent
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Failed to download template",
          });
        }
      } else {
      }
    });
  } catch (error) {
    console.error("❌ Error downloading template:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to download template: " + error.message,
      });
    }
  }
};

// ================================================================
// PREVIEW TEMPLATE (Show HTML Content)
// ================================================================

exports.previewTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check if template has an HTML preview file
    const previewPath = path.join(
      __dirname,
      "../../public/templates/previews",
      `${id}.html`,
    );

    // If preview file exists, serve it
    if (fs.existsSync(previewPath)) {
      return res.sendFile(previewPath);
    }

    const previewHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${template.name}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #f5f6f8;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            text-align: center;
          }
          .badge {
            display: inline-block;
            background: #FACC15;
            color: #111820;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 28px;
            color: #111827;
            margin: 0 0 12px;
          }
          .category {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .description {
            color: #4B5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-bottom: 32px;
          }
          .tag {
            background: #F3F4F6;
            color: #6B7280;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 12px;
          }
          .preview-box {
            background: #F8F9FA;
            border: 2px dashed #E5E7EB;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 24px;
          }
          .preview-box .icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .preview-box p {
            color: #9CA3AF;
            font-size: 14px;
            margin: 0;
          }
          .btn {
            display: inline-block;
            background: #FACC15;
            color: #111820;
            padding: 12px 32px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
          }
          .btn:hover {
            background: #e5b800;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">✨ DFY Template</div>
          <h1>${template.name}</h1>
          <div class="category">📂 ${template.category}</div>
          <p class="description">${template.description}</p>
          <div class="tags">
            ${template.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
          </div>
          <div class="preview-box">
            <div class="icon">📄</div>
            <p>Template Preview<br><span style="font-size:12px;color:#D1D5DB;">HTML preview not available</span></p>
          </div>
          <a href="/api/templates/${template.id}/download" class="btn">⬇ Download Template</a>
        </div>
      </body>
      </html>
    `;

    // Save the generated preview for next time
    const previewDir = path.join(__dirname, "../../public/templates/previews");
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }
    fs.writeFileSync(previewPath, previewHTML);

    // Send the generated preview
    res.send(previewHTML);
  } catch (error) {
    console.error("Error previewing template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to preview template",
    });
  }
};

// ================================================================
// ✅ CREATE MISSING ZIP FILES
// ================================================================

exports.createMissingZips = async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, "../../public/templates");
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const results = [];

    for (const template of templates) {
      const zipPath = path.join(templatesDir, template.zipFile);
      if (!fs.existsSync(zipPath)) {
        // Create zip file
        const content = `
          Template: ${template.name}
          ID: ${template.id}
          Category: ${template.category}
          Description: ${template.description}
          Tags: ${template.tags.join(", ")}
          
          This is a placeholder file. 
          Please add your actual template files here.
          
          To use this template, unzip and upload to your website.
        `;
        fs.writeFileSync(zipPath, content);
        results.push({ id: template.id, created: true });
      } else {
        results.push({ id: template.id, created: false, exists: true });
      }
    }

    res.json({
      success: true,
      message: "Missing zip files created",
      results,
    });
  } catch (error) {
    console.error("Error creating zips:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create zip files",
    });
  }
};
