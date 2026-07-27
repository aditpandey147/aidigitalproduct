import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ReportPDF from '../components/ReportPDF';
import { renderToString } from 'react-dom/server';
import toast from 'react-hot-toast';

const Reports = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewScan, setPreviewScan] = useState(null);
  const [previewCombined, setPreviewCombined] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      const websiteId = selectedWebsite._id || selectedWebsite.id;
      fetchScanHistory(websiteId);
    }
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const response = await api.get('/websites');
      setWebsites(response.data);
      if (response.data.length > 0) {
        setSelectedWebsite(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const fetchScanHistory = async (websiteId) => {
    try {
      const response = await api.get(`/scans/${websiteId}`);
      setScanHistory(response.data);
    } catch (error) {
      toast.error('Failed to load scan history');
    }
  };

  const downloadJSON = (scan) => {
    const report = {
      website: selectedWebsite?.url,
      scanDate: scan.createdAt,
      scores: {
        seo: scan.seoScore,
        security: scan.securityScore,
        compliance: scan.complianceScore,
        performance: scan.performanceScore
      },
      issues: scan.issues,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `compliscan-report-${selectedWebsite?.url}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('JSON report downloaded!');
  };

  const openPrintWindow = (htmlContent) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Complyzo Report</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>${htmlContent}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const downloadPDF = (scan) => {
    setGeneratingPdf(true);
    try {
      const htmlContent = renderToString(
        <ReportPDF scan={scan} websiteUrl={selectedWebsite?.url} />
      );
      openPrintWindow(htmlContent);
      toast.success('PDF report generated!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadCombinedPDF = () => {
    if (scanHistory.length === 0) {
      toast.error('No scan history available');
      return;
    }
    setGeneratingPdf(true);
    try {
      const htmlContent = renderToString(
        <ReportPDF isCombined scanHistory={scanHistory} websiteUrl={selectedWebsite?.url} />
      );
      openPrintWindow(htmlContent);
      toast.success('Combined PDF report generated!');
    } catch (error) {
      toast.error('Failed to generate combined PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const previewReport = (scan) => {
    setPreviewScan(scan);
    setPreviewCombined(false);
    setShowPreview(true);
  };

  const previewCombinedReport = () => {
    setPreviewCombined(true);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center h-screen p-4">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] w-full min-w-0">
        <Navbar />
        <main className="p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Scan Reports</h2>
              {scanHistory.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={previewCombinedReport}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm"
                  >
                    <i className="fa-solid fa-eye text-[10px] sm:text-xs"></i>
                    <span>Preview All</span>
                  </button>
                  <button
                    onClick={downloadCombinedPDF}
                    disabled={generatingPdf}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{generatingPdf ? 'Generating...' : 'Download All'}</span>
                  </button>
                </div>
              )}
            </div>
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm w-full sm:w-auto"
              value={selectedWebsite?._id || selectedWebsite?.id || ''}
              onChange={(e) => {
                const website = websites.find(w => (w._id || w.id).toString() === e.target.value);
                setSelectedWebsite(website);
              }}
            >
              {websites.map(website => (
                <option key={website._id || website.id} value={website._id || website.id}>
                  {website.url}
                </option>
              ))}
            </select>
          </div>

          {scanHistory.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {scanHistory.map((scan, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3 sm:mb-4">
                    <div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {formatDate(scan.createdAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 sm:gap-3 sm:flex sm:space-x-4 mt-2">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{scan.seoScore}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">SEO</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{scan.securityScore}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Security</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{scan.complianceScore}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Compliance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{scan.performanceScore}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Performance</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1.5 sm:space-x-2 flex-wrap gap-1.5">
                      <button
                        onClick={() => previewReport(scan)}
                        className="flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm"
                      >
                        <i className="fa-solid fa-eye text-[10px] sm:text-xs"></i>
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => downloadPDF(scan)}
                        disabled={generatingPdf}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => downloadJSON(scan)}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition text-xs sm:text-sm"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Issues Found ({scan.issues.length})</h4>
                    <div className="space-y-1">
                      {scan.issues.slice(0, 3).map((issue, idx) => (
                        <div key={idx} className="text-xs sm:text-sm text-gray-600">
                          • {issue.message}
                        </div>
                      ))}
                      {scan.issues.length > 3 && (
                        <div className="text-xs sm:text-sm text-primary">+{scan.issues.length - 3} more issues</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No scan reports available yet</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Run your first scan to generate reports</p>
            </div>
          )}
        </main>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-4xl mx-2 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                {previewCombined ? 'Combined Report Preview' : 'Report Preview'}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    if (previewCombined) {
                      downloadCombinedPDF();
                    } else if (previewScan) {
                      downloadPDF(previewScan);
                    }
                  }}
                  className="text-[10px] sm:text-xs bg-gray-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-800 transition"
                >
                  <i className="fa-solid fa-download mr-1"></i>Download
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
                >
                  <i className="fa-solid fa-xmark text-gray-500 text-xs sm:text-sm"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                {previewCombined ? (
                  <ReportPDF isCombined scanHistory={scanHistory} websiteUrl={selectedWebsite?.url} />
                ) : previewScan ? (
                  <ReportPDF scan={previewScan} websiteUrl={selectedWebsite?.url} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;