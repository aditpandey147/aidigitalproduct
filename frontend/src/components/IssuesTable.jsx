// src/components/IssuesTable.jsx
import React, { useState } from 'react';

const IssuesTable = ({ issues, pageDetails }) => {
  const [selectedPage, setSelectedPage] = useState('all');
  const [expandedPages, setExpandedPages] = useState({});

  // Separate broken link issues from regular issues
  const brokenLinkIssues = issues?.filter(i => i.message.includes('Broken link:')) || [];
  const regularIssues = issues?.filter(i => !i.message.includes('Broken link:')) || [];
  
  // Find the main broken links summary issue
  const brokenLinksSummary = issues?.find(i => i.message.startsWith('Found') && i.message.includes('broken links'));

  // Group issues by page URL
  const groupIssuesByPage = () => {
    if (!regularIssues || regularIssues.length === 0) return {};
    
    const grouped = {};
    regularIssues.forEach(issue => {
      const urlMatch = issue.message.match(/\[(.*?)\]/);
      const pageUrl = urlMatch ? urlMatch[1] : 'General';
      const cleanMessage = issue.message.replace(/\[.*?\]\s*/, '');
      
      if (!grouped[pageUrl]) {
        grouped[pageUrl] = [];
      }
      grouped[pageUrl].push({
        ...issue,
        message: cleanMessage
      });
    });
    return grouped;
  };

  const groupedIssues = groupIssuesByPage();
  const pageUrls = Object.keys(groupedIssues);
  
  const getDisplayIssues = () => {
    if (selectedPage === 'all') {
      return regularIssues || [];
    }
    return groupedIssues[selectedPage] || [];
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'Critical': 
        return <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>;
      case 'Warning': 
        return <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      default: 
        return <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPageStats = (pageUrl) => {
    const pageIssues = groupedIssues[pageUrl] || [];
    const criticalCount = pageIssues.filter(i => i.severity === 'Critical').length;
    const warningCount = pageIssues.filter(i => i.severity === 'Warning').length;
    const infoCount = pageIssues.filter(i => i.severity === 'Info').length;
    return { criticalCount, warningCount, infoCount, total: pageIssues.length };
  };

  const togglePageExpand = (pageUrl) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageUrl]: !prev[pageUrl]
    }));
  };

  const getPageScore = (pageUrl) => {
    if (!pageDetails || !pageDetails.length) return null;
    const pageDetail = pageDetails.find(p => p.url === pageUrl);
    if (pageDetail && pageDetail.scores) {
      const avgScore = Math.round((pageDetail.scores.seo + pageDetail.scores.security + 
                                   pageDetail.scores.compliance + pageDetail.scores.performance) / 4);
      return avgScore;
    }
    return null;
  };

  const displayIssues = getDisplayIssues();
  const hasManyIssues = displayIssues.length > 5;

  if (!issues || issues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Issues Found</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No issues found! Your website looks great!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Issues Found</h3>
        {pageUrls.length > 1 && (
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Pages ({regularIssues.length} issues)</option>
            {pageUrls.map(url => {
              const stats = getPageStats(url);
              return (
                <option key={url} value={url}>
                  {url.split('/').pop() || url} ({stats.total} issues)
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Broken Links Section */}
      {brokenLinksSummary && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-link-slash text-orange-600"></i>
              <span className="text-sm font-semibold text-orange-800">{brokenLinksSummary.message}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(brokenLinksSummary.severity)}`}>
              {brokenLinksSummary.severity}
            </span>
          </div>
          {brokenLinkIssues.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
              {brokenLinkIssues.map((link, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex items-center gap-2 p-1.5 bg-white rounded">
                  <i className="fa-solid fa-triangle-exclamation text-orange-500 text-[10px]"></i>
                  <span className="truncate">{link.message.replace('Broken link: ', '')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page-wise Issues Display */}
      {selectedPage === 'all' && pageUrls.length > 1 ? (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {pageUrls.map(pageUrl => {
            const pageIssues = groupedIssues[pageUrl];
            const stats = getPageStats(pageUrl);
            const isExpanded = expandedPages[pageUrl];
            const pageScore = getPageScore(pageUrl);
            const hasManyPageIssues = pageIssues.length > 5;
            
            return (
              <div key={pageUrl} className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => togglePageExpand(pageUrl)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <svg className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <i className="fas fa-link text-primary text-sm flex-shrink-0"></i>
                          <span className="font-medium text-gray-800 text-sm break-all">{pageUrl}</span>
                          {pageScore !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                              pageScore >= 80 ? 'bg-green-100 text-green-700' :
                              pageScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Score: {pageScore}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs flex-wrap">
                          {stats.criticalCount > 0 && <span className="text-red-600">🔴 {stats.criticalCount} Critical</span>}
                          {stats.warningCount > 0 && <span className="text-yellow-600">🟡 {stats.warningCount} Warnings</span>}
                          {stats.infoCount > 0 && <span className="text-blue-600">🔵 {stats.infoCount} Info</span>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">{stats.total} issue{stats.total !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className={`p-3 space-y-2 bg-white ${hasManyPageIssues ? 'max-h-64 overflow-y-auto' : ''}`}>
                    {pageIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 break-words">{issue.message}</p>
                          <div className="flex items-center space-x-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>{issue.severity}</span>
                            <span className="text-xs text-gray-500">{issue.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`space-y-3 ${hasManyIssues ? 'max-h-42 overflow-y-auto pr-1' : ''}`}>
          {displayIssues.map((issue, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {getSeverityIcon(issue.severity)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-words">{issue.message}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>{issue.severity}</span>
                  <span className="text-xs text-gray-500">{issue.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex flex-wrap justify-between gap-2">
        <span>📄 Pages: {pageUrls.length}</span>
        {brokenLinkIssues.length > 0 && (
          <span className="text-orange-600">🔗 Broken links: {brokenLinkIssues.length}</span>
        )}
        <span>⚠️ Total: {issues.length}</span>
      </div>
    </div>
  );
};

export default IssuesTable;