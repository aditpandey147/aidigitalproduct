// src/context/AIProfitContext.jsx
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AIProfitContext = createContext();

export const useAIProfit = () => {
  const context = useContext(AIProfitContext);
  if (!context) {
    throw new Error('useAIProfit must be used within AIProfitProvider');
  }
  return context;
};

export const AIProfitProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const loadChat = async (chatId) => {
    setChatLoading(true);
    try {
      const response = await api.get(`/ai-profit/chat/${chatId}`);
      if (response.data?.success) {
        setCurrentChat(response.data.chat);
        return response.data.chat;
      }
      return null;
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
      return null;
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async (chatId, message) => {
    try {
      const response = await api.post(`/ai-profit/chat/${chatId}`, { message });
      if (response.data?.success) {
        // Reload chat to get updated messages
        await loadChat(chatId);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const response = await api.delete(`/ai-profit/chat/${chatId}`);
      if (response.data?.success) {
        toast.success('Chat deleted');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
      return false;
    }
  };

  const updateChatTitle = async (chatId, title) => {
    try {
      const response = await api.put(`/ai-profit/chat/${chatId}/title`, { title });
      if (response.data?.success) {
        setCurrentChat(prev => prev ? { ...prev, title } : prev);
        toast.success('Title updated');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
      return false;
    }
  };

  const value = {
    currentChat,
    chatLoading,
    setCurrentChat,
    loadChat,
    sendMessage,
    deleteChat,
    updateChatTitle
  };

  return (
    <AIProfitContext.Provider value={value}>
      {children}
    </AIProfitContext.Provider>
  );
};

export default AIProfitProvider;