// pages/ranker/AIRanker.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AIRanker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'seo', label: 'SEO' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'optimization', label: 'Optimization' },
    { id: 'research', label: 'Research' },
    { id: 'technical', label: 'Technical' },
  ];

  // Fetch ranker agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai-ranker/agents');
      
      if (response.data?.success) {
        setAgents(response.data.agents);
      } else {
        toast.error('Failed to load ranker agents');
      }
    } catch (error) {
      console.error('❌ Error fetching ranker agents:', error);
      toast.error('Failed to load AI ranker agents');
    } finally {
      setLoading(false);
    }
  };

  // Create new chat and navigate
  const handleAgentClick = async (agent) => {
    if (!agent || !agent.slug) {
      toast.error('Invalid agent selected');
      return;
    }

    try {
      
      const response = await api.post('/ai-ranker/chat/new', { 
        agentSlug: agent.slug 
      });
      
      if (response.data?.success && response.data?.chat?.id) {
        const chatId = response.data.chat.id;
        navigate(`/ai-ranker/chat/${chatId}`);
      } else {
        toast.error('Failed to create chat');
      }
    } catch (error) {
      console.error('❌ Error creating ranker chat:', error);
      toast.error(error.response?.data?.message || 'Failed to start chat');
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || agent.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500">Loading AI ranker agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Ranker</h1>
                <p className="text-sm text-gray-500">
                  Choose a ranker agent to improve your website SEO and ranking
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search ranker agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Grid */}
          {filteredAgents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500 text-sm">No ranker agents found</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-sm text-emerald-600 hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent) => (
                <RankerCard 
                  key={agent.id} 
                  agent={agent} 
                  onClick={handleAgentClick} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Ranker Card Component
// ============================================================

const RankerCard = ({ agent, onClick }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      seo: 'SEO',
      ranking: 'Ranking',
      optimization: 'Optimization',
      research: 'Research',
      technical: 'Technical'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      seo: 'bg-emerald-100 text-emerald-700',
      ranking: 'bg-blue-100 text-blue-700',
      optimization: 'bg-amber-100 text-amber-700',
      research: 'bg-purple-100 text-purple-700',
      technical: 'bg-cyan-100 text-cyan-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={() => onClick(agent)}
      className="group bg-white rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300"
    >
      <div className="p-5">
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          style={{ backgroundColor: agent.color + '20' }}
        >
          <i 
            className={`fas ${agent.icon} text-xl`}
            style={{ color: agent.color }}
          ></i>
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
          {agent.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{agent.role}</p>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-3 min-h-[40px]">
          {agent.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(agent.category)}`}>
            {getCategoryLabel(agent.category)}
          </span>
          
          <button 
            className="text-xs font-medium text-emerald-600 group-hover:text-emerald-700 transition flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick(agent);
            }}
          >
            Chat Now
            <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRanker;