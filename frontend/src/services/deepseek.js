import axios from 'axios';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const getAIFix = async (issue, pageContent = '') => {
  try {
    if (!DEEPSEEK_API_KEY) return null;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [{
        role: 'system',
        content: 'You are a website fixing expert. Provide specific fixes based on the website issue. Use plain text only. No markdown, no asterisks, no bold. Just plain text with line breaks.'
      }, {
        role: 'user',
        content: `Fix this website issue:\nType: ${issue.type}\nMessage: ${issue.message}\nSeverity: ${issue.severity}\n\nWebsite info: ${pageContent ? pageContent.substring(0, 1000) : 'No content available'}\n\nGive a short fix with code example. Keep it under 200 words.`
      }],
      max_tokens: 400,
      temperature: 0.3
    }, {
      headers: { 
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      timeout: 15000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    return null;
  }
};

export const getAIExplain = async (issue, pageContent = '') => {
  try {
    if (!DEEPSEEK_API_KEY) return null;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [{
        role: 'system',
        content: 'Explain website issues simply. Use plain text only. No markdown, no asterisks. Short and clear.'
      }, {
        role: 'user',
        content: `Explain this issue: ${issue.type} - ${issue.message} (${issue.severity}). Keep it under 150 words. Use plain text.`
      }],
      max_tokens: 250,
      temperature: 0.3
    }, {
      headers: { 
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      timeout: 15000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    return null;
  }
};

export const getWebsiteAnalysis = async (websiteUrl, pageContent) => {
  try {
    if (!DEEPSEEK_API_KEY) return null;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [{
        role: 'system',
        content: 'Analyze websites and give recommendations. Use plain text only.'
      }, {
        role: 'user',
        content: `Analyze: ${websiteUrl}\n\nContent: ${pageContent ? pageContent.substring(0, 2000) : 'N/A'}\n\nGive top 3 improvements. Keep under 200 words.`
      }],
      max_tokens: 350,
      temperature: 0.3
    }, {
      headers: { 
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      timeout: 15000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    return null;
  }
};