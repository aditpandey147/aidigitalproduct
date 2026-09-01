// backend/controllers/topicController.js
const axios = require('axios');

// ================================================================
// GENERATE TOPICS USING DEEPSEEK API
// ================================================================

exports.generateTopics = async (req, res) => {
  try {
    const { topic, productType } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    console.log(`🔍 Generating topics for: ${topic} (${productType || 'ebook'})`);

    const productTypeLabel = {
      ebook: 'E-Book',
      guide: 'Guide',
      course: 'Online Course',
      template: 'Template',
      planner: 'Planner',
      checklist: 'Checklist',
      workbook: 'Workbook',
      'prompt-pack': 'AI Prompt Pack',
      spreadsheet: 'Spreadsheet',
      challenge: 'Challenge',
    }[productType] || 'Digital Product';

    // ✅ Use DeepSeek API
    const prompt = `
      Generate 6 trending and profitable topic ideas for a ${productTypeLabel} product in the "${topic}" niche.

      For each topic, provide:
      1. A catchy, SEO-friendly title
      2. Target audience
      3. 3-5 relevant keywords
      4. Estimated demand (1-100)
      5. Competition level (Low/Medium/High)
      6. Trending score (1-100)
      7. Brief description (2-3 sentences)
      8. Estimated sales potential
      9. Difficulty (Low/Medium/High)

      Format as valid JSON array with this exact structure:
      [
        {
          "id": 1,
          "title": "Topic Title",
          "niche": "${topic}",
          "trending": 85,
          "demand": 80,
          "competition": 45,
          "description": "Brief description here",
          "targetAudience": "Target audience",
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "estimatedSales": "2,500+",
          "difficulty": "Medium",
          "platform": "Amazon Kindle"
        }
      ]

      Return ONLY the valid JSON array, no other text.
    `;

    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert digital product researcher and topic finder. Generate trending, profitable topic ideas. Return only valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    let content = response.data.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    let topics = [];

    if (jsonMatch) {
      try {
        topics = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        topics = getFallbackTopics(topic, productType);
      }
    } else {
      try {
        topics = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        topics = getFallbackTopics(topic, productType);
      }
    }

    topics = topics.map((t, index) => ({
      ...t,
      id: t.id || index + 1,
    }));

    console.log(`✅ Generated ${topics.length} topics`);

    res.json({
      success: true,
      topics,
      count: topics.length,
    });

  } catch (error) {
    console.error('❌ Topic generation error:', error.message);
    
    const { topic, productType } = req.body;
    const fallbackTopics = getFallbackTopics(topic, productType);
    
    res.json({
      success: true,
      topics: fallbackTopics,
      count: fallbackTopics.length,
      fallback: true,
      message: 'Using sample topics (API rate limit or error)',
    });
  }
};

// ================================================================
// FALLBACK TOPICS
// ================================================================

function getFallbackTopics(topic, productType) {
  const labels = {
    ebook: 'E-Book',
    guide: 'Guide',
    course: 'Online Course',
    template: 'Template',
    planner: 'Planner',
    checklist: 'Checklist',
    workbook: 'Workbook',
    'prompt-pack': 'AI Prompt Pack',
    spreadsheet: 'Spreadsheet',
    challenge: 'Challenge',
  };
  const label = labels[productType] || 'Digital Product';

  const niches = {
    'AI': ['artificial intelligence', 'machine learning', 'automation', 'chatbots'],
    'Marketing': ['social media', 'SEO', 'content marketing', 'email marketing'],
    'Health': ['wellness', 'fitness', 'nutrition', 'mental health'],
    'Finance': ['investing', 'saving', 'budgeting', 'wealth'],
    'Productivity': ['time management', 'focus', 'organization', 'workflow'],
  };

  const matchedNiche = Object.keys(niches).find(n => 
    topic.toLowerCase().includes(n.toLowerCase())
  ) || 'AI';

  const keywords = niches[matchedNiche] || niches.AI;

  return [
    {
      id: 1,
      title: `The Complete ${topic} Guide: From Beginner to Expert`,
      niche: matchedNiche,
      trending: 92,
      demand: 85,
      competition: 50,
      description: `A comprehensive ${label} that covers everything you need to know about ${topic}. Perfect for beginners and experts alike.`,
      targetAudience: `Anyone interested in ${topic}`,
      keywords: [topic, 'guide', 'tutorial', 'beginners', 'mastery'],
      estimatedSales: '3,200+',
      difficulty: 'Medium',
      platform: 'Amazon Kindle',
    },
    {
      id: 2,
      title: `${topic} Mastery: The Ultimate Blueprint for Success`,
      niche: matchedNiche,
      trending: 88,
      demand: 82,
      competition: 60,
      description: `Learn the proven strategies and techniques to master ${topic} and achieve your goals faster.`,
      targetAudience: `Professionals and entrepreneurs in ${topic}`,
      keywords: [topic, 'mastery', 'success', 'strategies', 'blueprint'],
      estimatedSales: '2,800+',
      difficulty: 'Medium',
      platform: 'Gumroad',
    },
    {
      id: 3,
      title: `${topic} Secrets: What Nobody Tells You`,
      niche: matchedNiche,
      trending: 95,
      demand: 90,
      competition: 70,
      description: `Discover the hidden secrets and insider tips about ${topic} that most people don't know.`,
      targetAudience: `Advanced learners and professionals`,
      keywords: [topic, 'secrets', 'insider', 'tips', 'advanced'],
      estimatedSales: '4,500+',
      difficulty: 'High',
      platform: 'Gumroad',
    },
    {
      id: 4,
      title: `The ${topic} Revolution: Future-Proof Your Career`,
      niche: matchedNiche,
      trending: 85,
      demand: 78,
      competition: 45,
      description: `Stay ahead of the curve with this comprehensive ${label} about ${topic}. Prepare for the future.`,
      targetAudience: `Career-focused individuals in ${topic}`,
      keywords: [topic, 'future', 'career', 'innovation', 'revolution'],
      estimatedSales: '2,100+',
      difficulty: 'Medium',
      platform: 'Books',
    },
    {
      id: 5,
      title: `Zero to ${topic} Hero: Launch Your Journey Today`,
      niche: matchedNiche,
      trending: 90,
      demand: 88,
      competition: 55,
      description: `Start from zero and become a ${topic} expert with this step-by-step ${label}. No experience needed.`,
      targetAudience: `Complete beginners in ${topic}`,
      keywords: [topic, 'beginner', 'start', 'journey', 'zero to hero'],
      estimatedSales: '3,800+',
      difficulty: 'Low',
      platform: 'Gumroad',
    },
    {
      id: 6,
      title: `${topic} Pro: Advanced Strategies for Success`,
      niche: matchedNiche,
      trending: 82,
      demand: 75,
      competition: 65,
      description: `Take your ${topic} skills to the next level with advanced strategies used by top professionals.`,
      targetAudience: `Experienced professionals in ${topic}`,
      keywords: [topic, 'advanced', 'professional', 'strategies', 'success'],
      estimatedSales: '2,500+',
      difficulty: 'High',
      platform: 'Gumroad',
    },
  ];
}