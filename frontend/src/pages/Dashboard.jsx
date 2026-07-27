import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import IssuesTable from '../components/IssuesTable';
import AlertsPanel from '../components/AlertsPanel';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Google token check
  const googleToken = new URLSearchParams(location.search).get('token');
  
  if (googleToken) {
    localStorage.setItem('token', googleToken);
    window.location.href = '/dashboard';
    return null;
  }

  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningStep, setScanningStep] = useState('');
  const [scanOptions, setScanOptions] = useState({ maxPages: 10, scanDepth: 2 });
  const [showPageDetails, setShowPageDetails] = useState(false);
  const [scanMode, setScanMode] = useState('multi');

  if (!token) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchWebsites();
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      const websiteId = selectedWebsite._id || selectedWebsite.id;
      fetchLatestScan(websiteId);
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

  const fetchLatestScan = async (websiteId) => {
    try {
      const response = await api.get(`/scans/latest/${websiteId}`);
      setLatestScan(response.data);
    } catch (error) {
      console.error('Error fetching latest scan:', error);
    }
  };

  const fetchScanHistory = async (websiteId) => {
    try {
      const response = await api.get(`/scans/${websiteId}`);
      setScanHistory(response.data);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const simulateScanProgress = () => {
    const steps = scanMode === 'single' 
      ? [
          { progress: 25, step: 'Analyzing SEO elements...' },
          { progress: 50, step: 'Checking security headers...' },
          { progress: 75, step: 'Verifying SSL certificates...' },
          { progress: 100, step: 'Scan completed!' },
        ]
      : [
          { progress: 10, step: 'Initializing scanner...' },
          { progress: 20, step: 'Crawling website links...' },
          { progress: 35, step: 'Analyzing SEO elements...' },
          { progress: 50, step: 'Checking security headers...' },
          { progress: 65, step: 'Verifying SSL certificates...' },
          { progress: 75, step: 'Scanning compliance requirements...' },
          { progress: 85, step: 'Testing performance metrics...' },
          { progress: 95, step: 'Generating comprehensive report...' },
        ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].progress);
        setScanningStep(steps[currentStep].step);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    return interval;
  };

  const handleScan = async () => {
    if (!selectedWebsite) return;
    
    setScanning(true);
    setScanProgress(0);
    setScanningStep(scanMode === 'single' ? 'Starting single-page scan...' : 'Starting multi-page scan...');
    
    const progressInterval = simulateScanProgress();
    const websiteId = selectedWebsite._id || selectedWebsite.id;
    
    try {
      const payload = scanMode === 'single' 
        ? { websiteId, maxPages: 1, scanDepth: 1 }
        : { websiteId, maxPages: scanOptions.maxPages, scanDepth: scanOptions.scanDepth };
      
      const response = await api.post('/scans', payload);
      
      setScanProgress(100);
      setScanningStep('Scan completed!');
      
      setTimeout(() => {
        fetchLatestScan(websiteId);
        fetchScanHistory(websiteId);
        setScanning(false);
        setScanProgress(0);
        setScanningStep('');
        toast.success(`Scan done! ${response.data.pagesScanned || 1} pages analyzed.`);
      }, 1000);
      
    } catch (error) {
      console.error('Error performing scan:', error);
      toast.error('Scan failed.');
      setScanning(false);
      setScanProgress(0);
      setScanningStep('');
    } finally {
      clearInterval(progressInterval);
    }
  };

  const getOverallScore = () => {
    if (!latestScan) return 0;
    return Math.round((latestScan.seoScore + latestScan.securityScore + 
                       latestScan.complianceScore + latestScan.performanceScore) / 4);
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center h-screen p-4">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading dashboard...</p>
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
          <div className="mx-auto max-w-full">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Monitor your website's security and performance</p>
            </div>

            {/* Website Selector and Scan Controls */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:items-end">
                <div className="w-full md:flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    <i className="fas fa-globe mr-1 sm:mr-2 text-primary"></i>
                    Select Website
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                      value={selectedWebsite?._id || selectedWebsite?.id || ''}
                      onChange={(e) => {
                        const website = websites.find(w => (w._id || w.id).toString() === e.target.value);
                        setSelectedWebsite(website);
                      }}
                      disabled={scanning}
                    >
                      {websites.map((website, idx) => (
                        <option key={website._id || website.id} value={website._id || website.id}>
                          {idx === 0 && '⭐ '}{website.url}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                    </div>
                  </div>
                </div>
                
                {/* Scan Mode Toggle */}
                <div className="w-full md:w-auto">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    <i className="fas fa-toggle-on mr-1"></i>
                    Scan Mode
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setScanMode('single')}
                      className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        scanMode === 'single'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="fas fa-file-alt mr-1"></i>
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode('multi')}
                      className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        scanMode === 'multi'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="fas fa-layer-group mr-1"></i>
                      Multi
                    </button>
                  </div>
                </div>
                
                {scanMode === 'multi' && (
                  <div className="w-full md:w-32">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      <i className="fas fa-file-alt mr-1"></i>
                      Max Pages
                    </label>
                    <select
                      value={scanOptions.maxPages}
                      onChange={(e) => setScanOptions({ ...scanOptions, maxPages: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                      disabled={scanning}
                    >
                      <option value="5">5 pages</option>
                      <option value="10">10 pages</option>
                      <option value="20">20 pages</option>
                      <option value="50">50 pages</option>
                    </select>
                  </div>
                )}
                
                <div className="w-full md:w-auto">
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    {scanning ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm">Scanning... {scanProgress}%</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play text-xs"></i>
                        <span className="text-xs sm:text-sm">{scanMode === 'single' ? 'Run Single-Page Scan' : 'Run Multi-Page Scan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {scanMode === 'multi' && scanOptions.maxPages > 10 && (
                <div className="mt-3 text-[10px] sm:text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  <i className="fas fa-info-circle mr-1"></i>
                  Scanning {scanOptions.maxPages} pages may take a few minutes
                </div>
              )}
              
              {scanMode === 'single' && (
                <div className="mt-3 text-[10px] sm:text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                  <i className="fas fa-info-circle mr-1"></i>
                  Single-page scan will only analyze the homepage URL
                </div>
              )}
            </div>

            {/* Scan Progress Modal */}
            {scanning && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
                <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-[95%] sm:max-w-md w-full shadow-2xl">
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-7 h-7 sm:w-10 sm:h-10 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">Scanning Website</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-4">{scanningStep}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {scanMode === 'single' ? 'Scanning single page...' : `Scanning up to ${scanOptions.maxPages} pages...`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scan Stats Card */}
            {latestScan && latestScan.pagesScanned && !scanning && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-3 sm:p-4 mb-6 sm:mb-8">
                <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-file-alt text-primary text-base sm:text-xl"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-sm text-gray-500">Pages Scanned</div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">{latestScan.pagesScanned || 1}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-chart-line text-green-600 text-base sm:text-xl"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-sm text-gray-500">Overall Score</div>
                      <div className="text-lg sm:text-2xl font-bold text-green-600">{getOverallScore()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-purple-600 text-base sm:text-xl"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-sm text-gray-500">Total Issues</div>
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">{latestScan.issues?.length || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-clock text-orange-600 text-base sm:text-xl"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-sm text-gray-500">Last Scan</div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">
                        {new Date(latestScan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {latestScan.pageDetails && latestScan.pageDetails.length > 0 && (
                  <div className="mt-3 sm:mt-4 pt-3 border-t border-blue-200">
                    <button
                      onClick={() => setShowPageDetails(!showPageDetails)}
                      className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <i className={`fas fa-chevron-${showPageDetails ? 'up' : 'down'} text-[10px]`}></i>
                      {showPageDetails ? 'Hide' : 'Show'} Page Details ({latestScan.pageDetails.length} pages)
                    </button>
                    
                    {showPageDetails && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {latestScan.pageDetails.map((page, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-2 text-xs sm:text-sm">
                            <div className="font-medium text-gray-800 truncate" title={page.url}>
                              {page.url}
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs">
                              <span className="text-blue-600">SEO: {page.scores?.seo || 0}</span>
                              <span className="text-green-600">Sec: {page.scores?.security || 0}</span>
                              <span className="text-orange-600">Comp: {page.scores?.compliance || 0}</span>
                              <span className="text-purple-600">Perf: {page.scores?.performance || 0}</span>
                              <span className="text-red-500">Issues: {page.issuesCount || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Score Cards */}
            {latestScan && !scanning && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <ScoreCard title="SEO Score" score={latestScan.seoScore} color="blue" />
                <ScoreCard title="Security Score" score={latestScan.securityScore} color="green" />
                <ScoreCard title="Compliance Score" score={latestScan.complianceScore} color="orange" />
                <ScoreCard title="Performance Score" score={latestScan.performanceScore} color="purple" />
              </div>
            )}

            {/* Loading state */}
            {!latestScan && !scanning && (
              <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center mb-6 sm:mb-8">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No scan data available</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">Click "Run Scan" to start monitoring</p>
              </div>
            )}

            {/* Issues and Alerts */}
            {latestScan && !scanning && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <IssuesTable issues={latestScan.issues} pageDetails={latestScan.pageDetails} />
                <AlertsPanel alerts={alerts} />
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ml-64 {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 320px) {
          .ml-64 {
            margin-left: 0 !important;
          }
          main {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;