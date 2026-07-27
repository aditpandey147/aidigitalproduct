// pages/profit/AIProfitChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AIProfitChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useAuth();
  
  const [chat, setChat] = useState(null);
  const [agentChats, setAgentChats] = useState([]); // All chats for this agent
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat on mount
  useEffect(() => {
    if (chatId) {
      loadChat();
    }
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, sending]);

  const loadChat = async () => {
    setLoading(true);
    try {
      // Load current chat
      const response = await api.get(`/ai-profit/chat/${chatId}`);
      if (response.data?.success) {
        setChat(response.data.chat);
        console.log('✅ Chat loaded:', response.data.chat.agentName);
        
        // Load all chats for this agent
        await loadAgentChats(response.data.chat.agentSlug);
      } else {
        toast.error('Chat not found');
        navigate('/ai-profit-machine');
      }
    } catch (error) {
      console.error('❌ Error loading chat:', error);
      toast.error('Failed to load chat');
      navigate('/ai-profit-machine');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentChats = async (agentSlug) => {
    try {
      // Get all user chats
      const response = await api.get('/ai-profit/chats');
      if (response.data?.success) {
        // Filter chats for this specific agent
        const filtered = response.data.chats.filter(
          chat => chat.agentSlug === agentSlug
        );
        setAgentChats(filtered);
        console.log(`✅ Loaded ${filtered.length} chats for agent:`, agentSlug);
      }
    } catch (error) {
      console.error('❌ Error loading agent chats:', error);
    }
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;

    setInput('');
    setSending(true);

    try {
      const response = await api.post(`/ai-profit/chat/${chatId}`, { message });
      
      if (response.data?.success) {
        // Reload chat to get updated messages
        await loadChat();
        console.log('✅ Message sent');
      } else {
        toast.error('Failed to send message');
        setInput(message);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setInput(message);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBack = () => {
    navigate('/ai-profit-machine');
  };

  const handleSelectChat = (selectedChatId) => {
    if (selectedChatId !== chatId) {
      navigate(`/ai-profit-machine/chat/${selectedChatId}`);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diff = now - chatDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return chatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return chatDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return chatDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return null;
  }

  const agent = chat.agent || {
    name: chat.agentName,
    slug: chat.agentSlug,
    icon: 'fa-robot',
    color: '#3b82f6',
    role: 'AI Assistant'
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 flex overflow-hidden gap-0 md:gap-4 p-2 md:p-4">
          {/* Main Chat Area - Left Side */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
                <button
                  onClick={handleBack}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                >
                  <i className="fas fa-arrow-left text-gray-500"></i>
                </button>
                
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                  style={{ backgroundColor: agent.color + '20' }}
                >
                  <i className={`fas ${agent.icon} text-lg`} style={{ color: agent.color }}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {chat.title || chat.agentName}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                    {agent.name} • {agent.role}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full hidden sm:inline-block">
                    {chat.messageCount || 0} messages
                  </span>
                  
                  {/* Mobile toggle for history */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden w-9 h-9 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    <i className="fas fa-history text-gray-500"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              <div className="max-w-3xl mx-auto w-full space-y-4">
                {chat.messages && chat.messages.length > 0 ? (
                  chat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-end gap-3 animate-slideIn ${
                        msg.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                            : `bg-gradient-to-br from-blue-500 to-purple-500`
                        }`}
                      >
                        <i
                          className={`fas ${msg.role === 'user' ? 'fa-user' : agent.icon} text-white text-xs`}
                        ></i>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white border border-gray-100 shadow-md rounded-tl-none'
                        }`}
                      >
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div 
                      className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
                      style={{ backgroundColor: agent.color + '15' }}
                    >
                      <i className={`fas ${agent.icon} text-4xl`} style={{ color: agent.color }}></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Chat with {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      {agent.description || `Ask me about ${agent.role}`}
                    </p>
                  </div>
                )}
                
                {sending && (
                  <div className="flex items-end gap-3 animate-slideIn">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 shadow-sm">
                      <i className={`fas ${agent.icon} text-white text-xs`}></i>
                    </div>
                    <div className="bg-white border border-gray-100 shadow-md rounded-2xl rounded-tl-none px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                        <span className="text-xs text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
              <div className="max-w-3xl mx-auto w-full">
                <div className="flex items-end gap-2 bg-white border-2 border-gray-200 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all duration-200">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${agent.name}...`}
                    disabled={sending}
                    rows={1}
                    className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none resize-none text-sm text-gray-700 placeholder-gray-400 disabled:opacity-50 min-h-[40px] max-h-[200px]"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    {sending ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <i className="fas fa-paper-plane text-sm transform -rotate-12"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat History - Right Side */}
          <div className={`
            fixed md:relative inset-y-0 right-0 w-80 md:w-72 lg:w-80 
            bg-white shadow-2xl md:shadow-lg 
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            md:block flex-shrink-0 rounded-2xl md:rounded-2xl overflow-hidden
            z-30 md:z-auto
          `}>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>

            <div className="flex flex-col h-full">
              {/* History Header */}
              <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                    <i className="fas fa-history text-white text-xs"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Chat History</h4>
                    <p className="text-[10px] text-gray-400">
                      {agentChats.length} conversations with {agent.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                {agentChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <i className="fas fa-comment-slash text-gray-400 text-lg"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a new chat with {agent.name}</p>
                  </div>
                ) : (
                  agentChats.map((chatItem) => (
                    <button
                      key={chatItem.id}
                      onClick={() => handleSelectChat(chatItem.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group flex items-start gap-3 mb-1 ${
                        chatItem.id === chatId
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`fas ${agent.icon} text-blue-500 text-xs`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium truncate ${
                            chatItem.id === chatId ? 'text-blue-700' : 'text-gray-800'
                          }`}>
                            {chatItem.title || chatItem.agentName}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {formatDate(chatItem.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400 truncate">
                            {chatItem.preview || `${chatItem.messageCount || 0} messages`}
                          </p>
                          {chatItem.id === chatId && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* New Chat Button */}
              <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => navigate('/ai-profit-machine')}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus text-xs"></i>
                  New Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AIProfitChat;