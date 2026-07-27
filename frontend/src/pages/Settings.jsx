import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/websites');
      
      let websitesData = [];
      if (Array.isArray(response.data)) {
        websitesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        websitesData = response.data.websites || response.data.data || [];
      }
      
      setWebsites(websitesData);
      
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (website) => {
    setWebsiteToDelete(website);
    setShowDeletePopup(true);
  };

  const handleDeleteWebsite = async () => {
    if (!websiteToDelete) return;
    
    const websiteId = websiteToDelete._id || websiteToDelete.id;
    const websiteUrl = websiteToDelete.url;
    
    setDeleting(websiteId);
    setShowDeletePopup(false);
    
    try {
      await api.delete(`/websites/${websiteId}`);
      
      toast.success(`Successfully deleted ${websiteUrl}`);
      setWebsites(prev => prev.filter(w => (w._id || w.id) !== websiteId));
      
    } catch (error) {
      console.error('Error deleting website:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete website');
      }
    } finally {
      setDeleting(null);
      setWebsiteToDelete(null);
    }
  };

  const getPlanBadge = () => {
    const plan = user?.planName || user?.plan || 'Free';
    
    // Simple plan display without credits
    const planDisplay = {
      'Free': { bg: 'bg-gray-100 text-gray-700', icon: 'fa-box', label: 'Free Plan' },
      'Starter': { bg: 'bg-blue-100 text-blue-700', icon: 'fa-rocket', label: 'Starter Plan' },
      'Pro': { bg: 'bg-gradient-to-r from-primary to-secondary text-white', icon: 'fa-crown', label: 'Pro Plan' },
      'Growth': { bg: 'bg-green-100 text-green-700', icon: 'fa-chart-line', label: 'Growth Plan' },
      'Enterprise': { bg: 'bg-purple-100 text-purple-700', icon: 'fa-building', label: 'Enterprise Plan' },
    };

    const config = planDisplay[plan] || planDisplay['Free'];

    return (
      <div className="space-y-2">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg}`}>
          <i className={`fas ${config.icon} mr-1 text-xs`}></i> {config.label}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="loader mx-auto mb-4"></div>
              <p className="text-gray-500">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <i className="fas fa-user text-primary text-xl"></i>
                <h3 className="text-xl font-semibold">Profile Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                  {getPlanBadge()}
                </div>
              </div>
            </div>

            {/* Websites Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-globe text-primary text-xl"></i>
                  <h3 className="text-xl font-semibold">Your Websites</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {websites.length} {user?.plan === 'Pro' || user?.plan === 'Growth' || user?.plan === 'Enterprise' ? '' : `(Free: 1 max)`}
                </span>
              </div>

              {!websites || websites.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-globe text-gray-300 text-5xl mb-3"></i>
                  <p className="text-gray-500 text-lg">No websites added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first website to start monitoring</p>
                  <button
                    onClick={() => window.location.href = '/add-website'}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  >
                    <i className="fas fa-plus-circle mr-2"></i>
                    Add Website
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {websites.map((website) => (
                    <div
                      key={website._id || website.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-link text-primary"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{website.url}</p>
                          <p className="text-xs text-gray-500">
                            Added: {website.createdAt ? new Date(website.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(website)}
                        disabled={deleting === (website._id || website.id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        {deleting === (website._id || website.id) ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash-alt"></i>
                        )}
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription Section - Simplified */}
            {(user?.planName === 'Free' || user?.plan === 'free' || !user?.planName) && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <i className="fas fa-rocket text-primary text-xl"></i>
                  <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
                </div>
                <div className="border rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-2">Pro Plan</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500 mr-2 text-xs"></i>
                      Monitor up to 5 websites
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500 mr-2 text-xs"></i>
                      Weekly automated scans
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500 mr-2 text-xs"></i>
                      Email alerts
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500 mr-2 text-xs"></i>
                      Priority support
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    View Plans
                  </Link>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <i className="fas fa-bell text-primary text-xl"></i>
                <h3 className="text-xl font-semibold">Notification Preferences</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">
                      <i className="fas fa-envelope text-gray-500 mr-2"></i>
                      Email Alerts
                    </div>
                    <div className="text-sm text-gray-500">Receive critical alerts via email</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">
                      <i className="fab fa-whatsapp text-green-500 mr-2"></i>
                      WhatsApp Alerts
                    </div>
                    <div className="text-sm text-gray-500">Receive alerts on WhatsApp (Pro feature)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    disabled={user?.plan !== 'Pro' && user?.plan !== 'Growth'} 
                    className="w-4 h-4 text-green-500 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                <h3 className="text-xl font-semibold text-red-800">Danger Zone</h3>
              </div>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    toast.error('Account deletion would be processed here');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <i className="fas fa-trash-alt mr-2"></i>
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && websiteToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-trash-alt text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Website</h3>
                  <p className="text-sm opacity-90">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong className="font-semibold text-red-600">{websiteToDelete.url}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This will permanently remove the website and all its scan data from your account.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setWebsiteToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWebsite}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;