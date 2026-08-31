// pages/profit/AIProfitMachine.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AIProfitMachine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'profit_generation', label: 'Profit Generation' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'content', label: 'Content' },
    { id: 'sales', label: 'Sales' },
    { id: 'growth', label: 'Growth' },
  ];

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai-profit/agents');
      
      if (response.data?.success) {
        setAgents(response.data.agents);
      } else {
        toast.error('Failed to load agents');
      }
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      toast.error('Failed to load AI agents');
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
      
      const response = await api.post('/ai-profit/chat/new', { 
        agentSlug: agent.slug 
      });
      
      if (response.data?.success && response.data?.chat?.id) {
        const chatId = response.data.chat.id;
        navigate(`/ai-profit-machine/chat/${chatId}`);
      } else {
        toast.error('Failed to create chat');
      }
    } catch (error) {
      console.error('❌ Error creating chat:', error);
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
              <div className="absolute inset-0 border-4 border-t-[#FACC15] rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500">Loading AI agents...</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-robot text-[#111827] text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Profit Agents</h1>
                <p className="text-sm text-gray-500">
                  Choose an agent to start a conversation
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent shadow-sm"
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
                      ? 'bg-[#FACC15] text-[#111827] shadow-sm'
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
              <p className="text-gray-500 text-sm">No agents found</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-sm text-[#FACC15] hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent) => (
                <AgentCard 
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

// Agent Card Component
const AgentCard = ({ agent, onClick }) => {
  return (
    <div
      onClick={() => onClick(agent)}
      className="group bg-white rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15]"
    >
      <div className="p-5">
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          style={{ backgroundColor: '#FACC15' + '20' }}
        >
          <i 
            className={`fas ${agent.icon} text-xl`}
            style={{ color: '#FACC15' }}
          ></i>
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#F59E0B] transition-colors">
          {agent.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{agent.role}</p>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-3 min-h-[40px]">
          {agent.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            <i className="fas fa-robot text-[10px] text-[#FACC15] mr-1"></i>
            {agent.usageCount || 0} chats
          </span>
          
          <button 
            className="text-xs font-medium text-[#FACC15] group-hover:text-[#F59E0B] transition flex items-center gap-1"
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

export default AIProfitMachine;