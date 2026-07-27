import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ============================================================
// 📦 API SERVICE - PEXELS
// ============================================================

const searchImagesAPI = async ({ query, page = 1, perPage = 12, orientation = 'all', apiKey }) => {
  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY' || apiKey === 'your_pexels_api_key_here') {
    return {
      success: false,
      images: [],
      total: 0,
      totalPages: 0,
      error: 'Pexels API key is missing.'
    };
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: query,
        page: page,
        per_page: perPage,
        orientation: orientation === 'all' ? undefined : orientation,
        size: 'large',
      },
      headers: { 'Authorization': apiKey },
      timeout: 10000
    });

    const mappedImages = response.data.photos.map(photo => ({
      id: photo.id,
      previewURL: photo.src.tiny,
      webformatURL: photo.src.medium,
      largeImageURL: photo.src.large,
      fullhd: photo.src.large2x,
      original: photo.src.original,
      user: photo.photographer,
      alt: photo.alt || '',
    }));

    return {
      success: true,
      images: mappedImages,
      total: response.data.total_results || 0,
      totalPages: Math.ceil((response.data.total_results || 0) / perPage),
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      total: 0,
      totalPages: 0,
      error: error.response?.status === 401 
        ? 'Invalid API key. Please check your Pexels API key.'
        : error.response?.status === 429
        ? 'Rate limit exceeded. Please wait a moment.'
        : 'Failed to fetch images. Please try again.'
    };
  }
};

// ============================================================
// 🖼️ VISUAL LIBRARY
// ============================================================

const VisualLibrary = ({ apiKey, defaultQuery = 'Nature', perPage = 12 }) => {
  const [query, setQuery] = useState(defaultQuery);
  const [orientation, setOrientation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [downloading, setDownloading] = useState(null);
  
  const searchTimeout = useRef(null);

  const popularKeywords = ['Nature', 'Travel', 'Business', 'Food', 'Technology', 'People', 'Lifestyle', 'Sports', 'Music'];

  const collections = [
    { title: 'Travel Stories', keyword: 'Travel', count: '1,254 Images', icon: 'fa-globe-americas', image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Urban Life', keyword: 'City', count: '1,102 Images', icon: 'fa-city', image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Business Success', keyword: 'Business', count: '853 Images', icon: 'fa-chart-line', image: 'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Romantic Moments', keyword: 'Romantic', count: '842 Images', icon: 'fa-heart', image: 'https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Cinematic Drama', keyword: 'Cinematic', count: '1,036 Images', icon: 'fa-clapperboard', image: 'https://images.pexels.com/photos/220067/pexels-photo-220067.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Sports Energy', keyword: 'Sports', count: '768 Images', icon: 'fa-running', image: 'https://images.pexels.com/photos/206853/pexels-photo-206853.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

  const searchImages = useCallback(async (searchQuery, page = 1, orient = orientation) => {
    if (!searchQuery.trim()) {
      setImages([]);
      setTotal(0);
      setTotalPages(0);
      setSearchPerformed(false);
      return;
    }

    const cacheKey = `pexels_${searchQuery}_${orient}_${page}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp && Date.now() - data.timestamp < 300000) {
          setImages(data.images);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setSearchPerformed(true);
          return;
        }
      }
    } catch (e) {}

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const result = await searchImagesAPI({ query: searchQuery, page, perPage, orientation: orient, apiKey });
      if (result.success) {
        setImages(result.images);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        localStorage.setItem(cacheKey, JSON.stringify({ images: result.images, total: result.total, totalPages: result.totalPages, timestamp: Date.now() }));
      } else {
        setError(result.error);
        setImages([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (err) {
      setError('An error occurred');
      setImages([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [apiKey, perPage, orientation]);

  useEffect(() => {
    if (defaultQuery && apiKey) searchImages(defaultQuery, 1);
  }, []);

  const debouncedSearch = useCallback((value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchImages(value, 1), 500);
  }, [searchImages]);

  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(1); searchImages(query, 1); };
  const handleOrientationChange = (newOrientation) => { setOrientation(newOrientation); setCurrentPage(1); searchImages(query, 1, newOrientation); };
  const handlePageChange = (page) => { setCurrentPage(page); searchImages(query, page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleKeywordClick = (keyword) => { setQuery(keyword); setCurrentPage(1); searchImages(keyword, 1); };
  const handleCollectionClick = (keyword) => { setQuery(keyword); setCurrentPage(1); searchImages(keyword, 1); };

  // ✅ FIXED: Download image directly (not open in new tab)
  const downloadImage = async (url, filename) => {
    if (!url) return;
    
    setDownloading(filename || 'image');
    
    try {
      // ✅ Method 1: Fetch image as blob and download
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // ✅ Fallback: Use anchor tag with download attribute
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `image-${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(null);
    }
  };

  // ✅ Open image in new tab (view only)
  const viewImage = (url) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const getThumbUrl = (img) => img.previewURL || img.webformatURL || img.largeImageURL || '';
  const getImageUrl = (img) => img.largeImageURL || img.webformatURL || img.previewURL || '';

  return (
    <div className="px-4 mx-auto px-4 sm:px-6 py-8 bg-gray-50/50 min-h-screen">
      
      {/* ===== HERO SECTION ===== */}
      <div className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-white/70">
              <i className="fas fa-bolt text-indigo-400"></i> DFY Visual Library
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            Visual <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Story</span> Assets
          </h1>
          <p className="text-white/50 text-base mb-6">Find cinematic scenes for your next viral video.</p>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/20 transition">
              <div className="flex items-center flex-1 px-3">
                <i className="fas fa-search text-white/30 text-sm"></i>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); debouncedSearch(e.target.value); }}
                  placeholder="Search cinematic images..."
                  className="w-full bg-transparent border-0 px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none"
                />
              </div>
              <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2 whitespace-nowrap">
                <i className="fas fa-wand-magic-sparkles"></i> Instant Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {popularKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordClick(keyword)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    query === keyword 
                      ? 'bg-indigo-500/30 border-indigo-400/30 text-white' 
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  } border`}
                >
                  {keyword}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { value: 'all', label: 'All', icon: 'fa-border-all' },
                { value: 'landscape', label: 'Landscape', icon: 'fa-arrows-alt-h' },
                { value: 'portrait', label: 'Portrait', icon: 'fa-arrows-alt-v' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                    orientation === opt.value
                      ? 'bg-indigo-500/30 border-indigo-400/30 text-white'
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  } border`}
                >
                  <input type="radio" name="orientation" value={opt.value} checked={orientation === opt.value} onChange={() => handleOrientationChange(opt.value)} className="hidden" />
                  <i className={`fas ${opt.icon}`}></i>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </form>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-star text-indigo-400"></i>
            </div>
            <div>
              <div className="text-xl font-bold text-white">10M+</div>
              <div className="text-xs text-white/40">Premium Assets</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== COLLECTIONS ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-fire text-orange-500"></i> Featured Collections
          </h3>
          <span className="text-xs text-gray-400">Click any collection to search</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {collections.map((collection) => (
            <button
              key={collection.keyword}
              onClick={() => handleCollectionClick(collection.keyword)}
              className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-cover bg-center border-2 border-transparent hover:border-indigo-400 transition-all hover:scale-[1.02]"
              style={{ backgroundImage: `url(${collection.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition"></div>
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/20 transition"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center mb-1.5">
                  <i className={`fas ${collection.icon} text-white text-sm`}></i>
                </div>
                <div className="text-white text-sm font-semibold truncate">{collection.title}</div>
                <div className="text-white/50 text-xs">{collection.count}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-100/80 px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-images text-indigo-500"></i>
            <span className="font-semibold text-gray-800">
              {total > 0 ? query.charAt(0).toUpperCase() + query.slice(1) : 'Ready To Discover'}
            </span>
            <span className="text-sm text-gray-400">{total > 0 ? `${total} images found` : 'Search or choose a collection'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <i className="fas fa-layer-group"></i> {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Searching for images...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h4>
            <p className="text-sm text-gray-400 max-w-md">{error}</p>
            <button onClick={() => searchImages(query, 1)} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition">
              <i className="fas fa-rotate mr-2"></i> Try Again
            </button>
          </div>
        )}

        {!loading && !error && images.length === 0 && searchPerformed && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-image text-gray-300 text-2xl"></i>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Images Found</h4>
            <p className="text-sm text-gray-400 max-w-md">Try searching with different keywords or choose a collection above.</p>
          </div>
        )}

        {/* ✅ IMAGE GRID WITH FIXED DOWNLOAD */}
        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((img) => {
              const thumbUrl = getThumbUrl(img);
              const imageUrl = getImageUrl(img);
              if (!thumbUrl) return null;
              return (
                <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <img src={thumbUrl} alt={query} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full">
                      <h4 className="text-white text-sm font-semibold truncate">{query.charAt(0).toUpperCase() + query.slice(1)}</h4>
                      <span className="text-white/60 text-xs">{orientation} Visual Asset{img.user && ` • ${img.user}`}</span>
                      <div className="mt-2 flex gap-2">
                        {/* ✅ Download Button - NOW WORKS */}
                        <button 
                          onClick={() => downloadImage(imageUrl, `${query}-${img.id}.jpg`)} 
                          disabled={downloading === `${query}-${img.id}.jpg`}
                          className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-indigo-500/80 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download Image"
                        >
                          {downloading === `${query}-${img.id}.jpg` ? (
                            <i className="fas fa-spinner fa-spin text-sm"></i>
                          ) : (
                            <i className="fas fa-arrow-down text-sm"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {currentPage > 1 && (
              <button onClick={() => handlePageChange(currentPage - 1)} className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-500 transition flex items-center justify-center">
                <i className="fas fa-chevron-left text-xs"></i>
              </button>
            )}
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-9 h-9 rounded-xl border transition flex items-center justify-center text-sm font-medium ${pageNum === currentPage ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-500'}`}>
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <button onClick={() => handlePageChange(currentPage + 1)} className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-500 transition flex items-center justify-center">
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualLibrary;