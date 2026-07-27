const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email alert
const sendEmailAlert = async (userId, websiteUrl, issues) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    const issueList = issues.map(i => `• ${i.message}`).join('\n');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `🔴 CRITICAL: Issues detected on ${websiteUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🔴 Critical Issues Detected</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Dear ${user.name},</p>
            <p style="font-size: 16px; color: #333;">Our automated scan has detected <strong>${issues.length} critical issue(s)</strong> on your website:</p>
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Website: ${websiteUrl}</p>
              <pre style="white-space: pre-wrap; margin: 0; color: #333;">${issueList}</pre>
            </div>
            <p style="margin: 20px 0;">Please log in to your CompliScan dashboard to view detailed solutions and fix these issues.</p>
            <a href="http://localhost:3000/ai-fixer" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View & Fix Issues</a>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from CompliScan. You received this because you enabled email notifications in your automation settings.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email alert sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

// WhatsApp alert (mock - integrate with actual WhatsApp Business API)
const sendWhatsAppAlert = async (userId, websiteUrl, issues) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Mock WhatsApp API call
    // In production, use Twilio WhatsApp API or WhatsApp Business API
    console.log(`WhatsApp alert would be sent to ${user.phone || user.email} for ${websiteUrl}`);
    console.log(`Issues: ${issues.map(i => i.message).join(', ')}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('WhatsApp send failed:', error);
    return false;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = { sendEmailAlert, sendWhatsAppAlert, testEmailConfig };