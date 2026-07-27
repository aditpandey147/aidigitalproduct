import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Analytics = () => {
  const { token } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  if (!token) {
    return <Navigate to="/login" />;
  }

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
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
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

  const getFilteredData = () => {
    let filtered = [...scanHistory].reverse();
    
    switch(timeRange) {
      case '7days':
        filtered = filtered.slice(-7);
        break;
      case '30days':
        filtered = filtered.slice(-30);
        break;
      default:
        break;
    }
    
    return filtered.map(scan => ({
      date: new Date(scan.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: new Date(scan.createdAt).toLocaleString(),
      seo: scan.seoScore,
      security: scan.securityScore,
      compliance: scan.complianceScore,
      performance: scan.performanceScore
    }));
  };

  const chartData = getFilteredData();

  const BarChart = ({ data, barColor, title, icon, dataKey }) => {
    if (data.length === 0) return null;
    
    const maxBarHeight = 160;
    const maxValue = 100;
    
    const latestValue = data[data.length - 1]?.[dataKey] || 0;
    const avgValue = Math.round(data.reduce((a,b) => a + b[dataKey], 0) / data.length);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: barColor + '15' }}>
              <i className={`fa-solid ${icon} text-sm`} style={{ color: barColor }}></i>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: barColor }}>{latestValue}</div>
            <div className="text-[10px] text-gray-400">/100</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4 text-[10px] text-gray-500">
          <span>Avg: <span className="font-medium text-gray-700">{avgValue}</span></span>
          <span>High: <span className="font-medium text-gray-700">{Math.max(...data.map(d => d[dataKey]))}</span></span>
          <span>Low: <span className="font-medium text-gray-700">{Math.min(...data.map(d => d[dataKey]))}</span></span>
        </div>
        
        <div className="flex items-end justify-between gap-1 h-40">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              <div 
                className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                style={{ 
                  height: `${(item[dataKey] / maxValue) * maxBarHeight}px`,
                  backgroundColor: barColor,
                  minHeight: item[dataKey] > 0 ? '3px' : '1px'
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  <span className="font-semibold">{item[dataKey]}</span>
                </div>
              </div>
              <div className="text-[9px] text-gray-400 mt-1.5 truncate w-full text-center">
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] overflow-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <p className="text-xs text-gray-500 mt-0.5">Website performance trends over time</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Website</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                
                <div className="w-full sm:w-40">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Time Range</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Charts */}
            {scanHistory.length > 0 && chartData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <BarChart data={chartData} barColor="#3B82F6" title="SEO Score" icon="fa-chart-line" dataKey="seo" />
                  <BarChart data={chartData} barColor="#10B981" title="Security Score" icon="fa-shield" dataKey="security" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <BarChart data={chartData} barColor="#F59E0B" title="Compliance Score" icon="fa-scale-balanced" dataKey="compliance" />
                  <BarChart data={chartData} barColor="#8B5CF6" title="Performance Score" icon="fa-gauge-high" dataKey="performance" />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-chart-simple text-gray-300"></i>
                </div>
                <p className="text-sm font-medium text-gray-900">No data</p>
                <p className="text-xs text-gray-500 mt-1">Run a scan to see analytics</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;