// pages/VisualLibraryPage.jsx
import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import VisualLibrary from '../../components/dfy/VisualLibrary';

const VisualLibraryPage = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <VisualLibrary 
            apiKey={import.meta.env.VITE_PIXABAY_API_KEY || 'YOUR_PIXABAY_API_KEY'}
            defaultQuery="Nature"
            perPage={12}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualLibraryPage;