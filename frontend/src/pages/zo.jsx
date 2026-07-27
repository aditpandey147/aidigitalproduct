import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getAIFix, getAIExplain } from '../services/deepseek';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const AIFixer = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [issues, setIssues] = useState([]);
  const [pageContent, setPageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showWebsiteDropdown, setShowWebsiteDropdown] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showIssuePanel, setShowIssuePanel] = useState(true);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageIdCounter = useRef(0);
  
  const generateUniqueId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const stripMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '');
  };

  useEffect(() => {
    fetchWebsites();
    
    setTimeout(() => {
      setChatMessages([{
        id: generateUniqueId(),
        type: 'bot',
        content: `👋 Hello! I'm your AI Website Fixer\n\nI can help you find and fix issues on your website.\n\nTo get started: Select a website from the top-right corner!`,
        timestamp: new Date()
      }]);
    }, 500);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWebsiteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchWebsites = async () => {
    try {
      const response = await api.get('/websites');
      setWebsites(response.data);
    } catch (error) {
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteSelect = async (website) => {
    setSelectedWebsite(website);
    setShowWebsiteDropdown(false);
    setIssues([]);
    setPageContent('');
    
    addBotMessage(`🔍 Analyzing ${website.url}...`);
    
    try {
      const websiteId = website._id || website.id;
      const response = await api.get(`/scans/latest/${websiteId}`);
      const websiteIssues = response.data?.issues || [];
      const pageDetails = response.data?.pageDetails || [];
      
      // Extract page content for AI context
      let content = '';
      if (pageDetails.length > 0) {
        content = pageDetails.map(p => 
          `URL: ${p.url}\nScores: SEO:${p.scores?.seo || 0}, Security:${p.scores?.security || 0}, Compliance:${p.scores?.compliance || 0}, Performance:${p.scores?.performance || 0}`
        ).join('\n\n');
      }
      setPageContent(content);
      setIssues(websiteIssues);
      
      if (websiteIssues.length === 0) {
        addBotMessage(`✅ No issues found on ${website.url}\n\nYour website looks clean!`);
      } else {
        const criticalCount = websiteIssues.filter(i => i.severity === 'Critical').length;
        const warningCount = websiteIssues.filter(i => i.severity === 'Warning').length;
        
        let msg = `📊 Analysis Complete: ${website.url}\n\n`;
        msg += `Found ${websiteIssues.length} issues (${criticalCount} critical, ${warningCount} warnings)\n\n`;
        msg += `Check the right panel for all issues. Click Fix or Explain on any issue.`;
        
        addBotMessage(msg);
      }
    } catch (error) {
      addBotMessage(`❌ Scan failed\n\nUnable to analyze ${website.url}.`);
    }
  };

  const addBotMessage = (content) => {
    setChatMessages(prev => [...prev, {
      id: generateUniqueId(),
      type: 'bot',
      content,
      timestamp: new Date()
    }]);
  };

  const extractCodeFromResponse = (response) => {
    const codeMatch = response?.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : response || '';
  };

  const handleFixIssue = async (issue) => {
    setIsAiResponding(true);

    try {
      const aiFix = await getAIFix(issue, pageContent);
      
      if (aiFix) {
        const cleanFix = stripMarkdown(aiFix);
        const code = extractCodeFromResponse(cleanFix);
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          type: 'bot',
          content: `🤖 ${issue.message}\n\n${cleanFix}`,
          timestamp: new Date(),
          hasFix: true,
          fixCode: code,
          fixTitle: 'ai-fix'
        }]);
      } else {
        const fixData = getFixData(issue);
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          type: 'bot',
          content: fixData.message,
          timestamp: new Date(),
          fixCode: fixData.code,
          fixTitle: fixData.title,
          hasFix: true
        }]);
      }
    } catch (error) {
      const fixData = getFixData(issue);
      setChatMessages(prev => [...prev, {
        id: generateUniqueId(),
        type: 'bot',
        content: fixData.message,
        timestamp: new Date(),
        fixCode: fixData.code,
        fixTitle: fixData.title,
        hasFix: true
      }]);
    }
    
    setIsAiResponding(false);
  };

  const handleExplainIssue = async (issue) => {
    setIsAiResponding(true);

    try {
      const aiExplanation = await getAIExplain(issue, pageContent);
      
      if (aiExplanation) {
        const cleanExplanation = stripMarkdown(aiExplanation);
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          type: 'bot',
          content: `💡 ${issue.message}\n\n${cleanExplanation}`,
          timestamp: new Date()
        }]);
      } else {
        const explanation = getExplanation(issue);
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          type: 'bot',
          content: explanation,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      const explanation = getExplanation(issue);
      setChatMessages(prev => [...prev, {
        id: generateUniqueId(),
        type: 'bot',
        content: explanation,
        timestamp: new Date()
      }]);
    }
    
    setIsAiResponding(false);
  };

  const getFixData = (issue) => {
    const fixes = {
      'Missing meta description': {
        title: 'meta-description-fix',
        message: `📝 Fix for Missing Meta Description\n\nAdd inside <head>:\n\n<meta name="description" content="Your description (150-160 chars)">\n\n✅ Copied!`,
        code: `<meta name="description" content="Your compelling description here (150-160 characters). Include primary keyword naturally.">`
      },
      'Missing H1 tag': {
        title: 'h1-tag-fix',
        message: `📖 Fix for Missing H1 Tag\n\nAdd to your main content:\n\n<h1>Your Main Heading</h1>\n\nOnly ONE H1 per page!\n\n✅ Copied!`,
        code: `<h1>Your Primary Keyword Rich Main Heading</h1>`
      },
      'SSL certificate issue detected': {
        title: 'ssl-fix',
        message: `🔒 SSL Fix\n\nAdd to .htaccess:\n\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]\n\n✅ Copied!`,
        code: `RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]`
      },
      'Cookie banner not detected': {
        title: 'cookie-banner-fix',
        message: `🍪 Cookie Banner Fix\n\nAdd before </body>:\n\n<div id="cookieConsent" style="position:fixed;bottom:0;...">Cookie banner code</div>\n\n✅ Copied!`,
        code: `<div id="cookieConsent" style="position:fixed;bottom:0;left:0;right:0;background:#2563EB;color:white;padding:15px;text-align:center;z-index:9999;">\n  <span>🍪 We use cookies.</span>\n  <button onclick="acceptCookies()" style="background:white;color:#2563EB;padding:5px 15px;margin-left:10px;border:none;border-radius:5px;cursor:pointer;">Accept</button>\n</div>`
      }
    };

    const defaultFix = {
      title: 'issue-fix',
      message: `🔧 Fix: ${issue.message}\n\nImplement best practices for ${issue.type}.`,
      code: `// Fix for: ${issue.message}\n// Follow ${issue.type} best practices`
    };

    const result = fixes[issue.message] || defaultFix;
    
    try {
      navigator.clipboard.writeText(result.code);
      toast.success('Code copied!');
    } catch (err) {}
    
    return result;
  };

  const getExplanation = (issue) => {
    const explanations = {
      'Missing meta description': `📝 Meta Description\n\nShows in search results below your title.\n\nWithout it: Google shows random text, lower CTR.\nBest: 150-160 chars with keywords.`,
      'Missing H1 tag': `📖 H1 Tag\n\nMain heading of your page.\n\nWithout it: Poor SEO structure.\nBest: One H1 per page with primary keyword.`,
      'SSL certificate issue detected': `🔒 SSL Certificate\n\nEncrypts data between site and visitors.\n\nWithout it: "Not Secure" warning, lower rankings.\nFix: Install SSL, force HTTPS.`,
      'Cookie banner not detected': `🍪 Cookie Consent\n\nRequired under GDPR for non-essential cookies.\n\nWithout it: Fines up to €20M or 4% of revenue.\nFix: Add consent banner.`
    };

    return explanations[issue.message] || `💡 ${issue.message}\n\nThis ${issue.type} issue needs attention. Fix it to improve your site.`;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isAiResponding) return;
    
    setChatMessages(prev => [...prev, {
      id: generateUniqueId(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }]);
    const msg = inputMessage.toLowerCase();
    setInputMessage('');
    setIsAiResponding(true);
    
    setTimeout(() => {
      if (msg.includes('hello') || msg.includes('hi')) {
        addBotMessage(`👋 Hello!\n\n${selectedWebsite ? `I found ${issues.length} issues on your site.` : 'Select a website to start!'}`);
      } else if (msg.includes('scan')) {
        if (selectedWebsite) handleWebsiteSelect(selectedWebsite);
        else addBotMessage(`📋 Please select a website first!`);
      } else {
        addBotMessage(`💬 ${selectedWebsite ? `Found ${issues.length} issues. Check the right panel.` : 'Select a website to begin.'}`);
      }
      setIsAiResponding(false);
    }, 500);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const downloadFixFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const getSeverityStyle = (severity) => {
    return severity === 'Critical' 
      ? 'border-l-4 border-l-red-500 bg-red-50/50' 
      : 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
  };

  const getSeverityBadge = (severity) => {
    return severity === 'Critical'
      ? 'bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-medium'
      : 'bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-medium';
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center h-screen p-4">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col h-screen overflow-hidden">
        <Navbar />
        
        <div className="flex-1 flex overflow-hidden relative">
          
          <div className="flex-1 flex flex-col min-w-0 relative">
            
            <div className="absolute top-2 right-2 sm:top-3 sm:right-4 z-30" ref={dropdownRef}>
              <button
                onClick={() => setShowWebsiteDropdown(!showWebsiteDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <i className="fas fa-globe text-white text-[8px] sm:text-[10px]"></i>
                </div>
                <span className="text-gray-700 max-w-[80px] sm:max-w-[140px] truncate text-xs sm:text-sm font-medium">
                  {selectedWebsite?.url || 'Select'}
                </span>
                <i className={`fas fa-chevron-down text-gray-400 text-[8px] sm:text-[10px] transition ${showWebsiteDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showWebsiteDropdown && (
                <div className="absolute top-full right-0 mt-1 w-64 sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-2 sm:p-2.5 border-b bg-gray-50">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Your Websites</p>
                  </div>
                  <div className="max-h-40 sm:max-h-52 overflow-y-auto">
                    {websites.length === 0 ? (
                      <div className="p-3 sm:p-4 text-center">
                        <i className="fas fa-globe text-gray-300 text-xl sm:text-2xl mb-1 sm:mb-2"></i>
                        <p className="text-xs sm:text-sm text-gray-500">No websites added</p>
                      </div>
                    ) : (
                      websites.map((website) => (
                        <button
                          key={website._id || website.id}
                          onClick={() => handleWebsiteSelect(website)}
                          className={`w-full text-left px-2.5 sm:px-3 py-2 sm:py-2.5 hover:bg-gray-50 text-xs sm:text-sm flex items-center gap-2 transition ${
                            selectedWebsite?._id === website._id ? 'bg-blue-50 border-l-2 border-blue-500' : 'border-l-2 border-transparent'
                          }`}
                        >
                          <span className={`truncate font-medium ${selectedWebsite?._id === website._id ? 'text-blue-700' : 'text-gray-700'}`}>{website.url}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 pt-12 sm:pt-14 bg-gray-50/50">
              <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' ? 'bg-gray-700' : 'bg-blue-600'
                      }`}>
                        <i className={`fas fa-${message.type === 'user' ? 'user' : 'robot'} text-white text-[8px] sm:text-[10px]`}></i>
                      </div>
                      
                      <div className={`rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm leading-relaxed ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.hasFix && message.fixCode && (
                          <div className="mt-1.5 sm:mt-2">
                            <div className="bg-gray-900 rounded-md p-2 sm:p-2.5 overflow-x-auto">
                              <pre className="text-green-400 text-[10px] sm:text-[11px] font-mono whitespace-pre-wrap leading-relaxed">{message.fixCode}</pre>
                            </div>
                            <div className="flex gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
                              <button onClick={() => copyToClipboard(message.fixCode)} className="text-[9px] sm:text-[10px] bg-blue-500 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded hover:bg-blue-600 transition">
                                <i className="fas fa-copy mr-1"></i>Copy
                              </button>
                              <button onClick={() => downloadFixFile(message.fixCode, `${message.fixTitle || 'fix'}.txt`)} className="text-[9px] sm:text-[10px] bg-gray-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded hover:bg-gray-700 transition">
                                <i className="fas fa-download mr-1"></i>Download
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className={`text-[8px] sm:text-[9px] mt-1 sm:mt-1.5 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAiResponding && (
                  <div className="flex justify-start">
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <i className="fas fa-robot text-white text-[8px] sm:text-[10px]"></i>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm">
                        <div className="flex gap-0.5 sm:gap-1">
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="bg-white border-t p-2 sm:p-3">
              <div className="max-w-2xl mx-auto flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={selectedWebsite ? "Type..." : "Select website first..."}
                  disabled={!selectedWebsite}
                  className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAiResponding || !selectedWebsite}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div className={`${showIssuePanel ? 'w-72 sm:w-80' : 'w-0'} border-l border-gray-200 bg-white transition-all duration-300 flex flex-col h-full overflow-hidden`}>
            <div className="p-2 sm:p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Issues</h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500">
                  {issues.length > 0 ? `${issues.length} found` : 'None'}
                </p>
              </div>
              <button
                onClick={() => setShowIssuePanel(!showIssuePanel)}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
              >
                <i className={`fas fa-chevron-${showIssuePanel ? 'right' : 'left'} text-gray-600 text-[8px] sm:text-[10px]`}></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!selectedWebsite ? (
                <div className="p-4 sm:p-6 text-center">
                  <i className="fas fa-arrow-left text-gray-300 text-2xl sm:text-3xl mb-1 sm:mb-2"></i>
                  <p className="text-xs sm:text-sm text-gray-400">Select a website</p>
                </div>
              ) : issues.length === 0 ? (
                <div className="p-4 sm:p-6 text-center">
                  <i className="fas fa-check-circle text-green-400 text-2xl sm:text-3xl mb-1 sm:mb-2"></i>
                  <p className="text-xs sm:text-sm text-gray-500">No issues found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {issues.map((issue, idx) => (
                    <div key={idx} className={`p-2 sm:p-3 hover:bg-gray-50 transition ${getSeverityStyle(issue.severity)}`}>
                      <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5">
                        <span className={getSeverityBadge(issue.severity)}>
                          {issue.severity}
                        </span>
                        <span className="text-[7px] sm:text-[9px] text-gray-400 bg-gray-100 px-1 sm:px-1.5 py-0.5 rounded">{issue.type}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-1.5 sm:mb-2 leading-relaxed">{issue.message}</p>
                      <div className="flex gap-1 sm:gap-1.5">
                        <button
                          onClick={() => handleFixIssue(issue)}
                          className="flex-1 text-[8px] sm:text-[10px] bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-green-600 transition font-medium"
                        >
                          <i className="fas fa-wrench mr-1"></i>Fix
                        </button>
                        <button
                          onClick={() => handleExplainIssue(issue)}
                          className="flex-1 text-[8px] sm:text-[10px] bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-600 transition font-medium"
                        >
                          <i className="fas fa-info-circle mr-1"></i>Explain
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedWebsite && issues.length > 0 && (
              <div className="p-1.5 sm:p-2 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-gray-500">
                  <span>{issues.filter(i => i.severity === 'Critical').length} critical</span>
                  <span>{issues.filter(i => i.severity === 'Warning').length} warnings</span>
                </div>
              </div>
            )}
          </div>
          
          {!showIssuePanel && (
            <button
              onClick={() => setShowIssuePanel(true)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg px-1 sm:px-1.5 py-2 sm:py-3 shadow-md hover:bg-gray-50 transition z-20"
            >
              <i className="fas fa-chevron-left text-gray-500 text-xs sm:text-sm"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFixer;