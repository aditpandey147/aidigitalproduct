import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ============================================================
// 🔑 API KEY VALIDATION
// ============================================================

const VALID_API_KEY = '563492ad6f91700001000001198295a089f440f88acf6b59786293eb';

const validateApiKey = (key) => {
  if (!key) return false;
  if (key === 'YOUR_PEXELS_API_KEY') return false;
  if (key === 'your_pexels_api_key_here') return false;
  if (key.length < 10) return false;
  return true;
};

// ============================================================
// 📦 API SERVICE - PEXELS VIDEOS
// ============================================================

const searchVideosAPI = async ({ query, page = 1, perPage = 12, orientation = 'all', apiKey }) => {
  // ✅ Use the valid API key if provided, otherwise use the default
  const keyToUse = apiKey && validateApiKey(apiKey) ? apiKey : VALID_API_KEY;
  
  if (!validateApiKey(keyToUse)) {
    return {
      success: false,
      videos: [],
      total: 0,
      totalPages: 0,
      error: 'Pexels API key is missing or invalid.'
    };
  }

  try {
    console.log('📡 Fetching videos from Pexels...');
    
    const response = await axios.get('https://api.pexels.com/videos/search', {
      params: {
        query: query,
        page: page,
        per_page: perPage,
        orientation: orientation === 'all' ? undefined : orientation,
        size: 'large',
      },
      headers: { 
        'Authorization': keyToUse 
      },
      timeout: 15000
    });

    if (!response.data || !response.data.videos) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: 'No videos found'
      };
    }

    const mappedVideos = response.data.videos.map(video => ({
      id: video.id,
      title: query,
      duration: video.duration || 0,
      width: video.width || 0,
      height: video.height || 0,
      thumbnail: video.image || '',
      user: video.user?.name || 'Unknown',
      // Get the best quality video
      videoUrl: video.video_files?.find(f => f.quality === 'hd')?.link || 
                video.video_files?.find(f => f.quality === 'sd')?.link ||
                video.video_files?.[0]?.link || '',
      // Get the best thumbnail
      thumbnailUrl: video.video_pictures?.find(p => p.width >= 640)?.picture || 
                     video.image || '',
    }));

    return {
      success: true,
      videos: mappedVideos,
      total: response.data.total_results || 0,
      totalPages: Math.ceil((response.data.total_results || 0) / perPage),
    };
  } catch (error) {
    console.error('❌ Video search failed:', error);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: 'Invalid API key. Please check your Pexels API key.'
      };
    }
    
    if (error.response?.status === 429) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      };
    }
    
    return {
      success: false,
      videos: [],
      total: 0,
      totalPages: 0,
      error: error.message || 'Failed to fetch videos. Please try again.'
    };
  }
};

// ============================================================
// 🎬 VIDEO LIBRARY - MAIN COMPONENT
// ============================================================

const VideoLibrary = ({ apiKey, defaultQuery = 'Nature', perPage = 12 }) => {
  const [query, setQuery] = useState(defaultQuery);
  const [orientation, setOrientation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const searchTimeout = useRef(null);

  const popularKeywords = ['Nature', 'Travel', 'Business', 'Food', 'Technology', 'People', 'Lifestyle', 'Sports', 'Music'];

  const collections = [
    { title: 'Travel Scenes', keyword: 'Travel', count: '1,254 Videos', icon: 'fa-globe-americas', image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Urban Life', keyword: 'City', count: '1,102 Videos', icon: 'fa-city', image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Business Success', keyword: 'Business', count: '853 Videos', icon: 'fa-chart-line', image: 'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Romantic Moments', keyword: 'Romantic', count: '842 Videos', icon: 'fa-heart', image: 'https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Cinematic Drama', keyword: 'Cinematic', count: '1,036 Videos', icon: 'fa-clapperboard', image: 'https://images.pexels.com/photos/220067/pexels-photo-220067.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: 'Sports Energy', keyword: 'Sports', count: '768 Videos', icon: 'fa-running', image: 'https://images.pexels.com/photos/206853/pexels-photo-206853.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

  const searchVideos = useCallback(async (searchQuery, page = 1, orient = orientation) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      setTotal(0);
      setTotalPages(0);
      setSearchPerformed(false);
      return;
    }

    const cacheKey = `pexels_videos_${searchQuery}_${orient}_${page}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp && Date.now() - data.timestamp < 300000) {
          setVideos(data.videos);
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
      const result = await searchVideosAPI({ 
        query: searchQuery, 
        page, 
        perPage, 
        orientation: orient, 
        apiKey 
      });
      
      if (result.success) {
        setVideos(result.videos);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        localStorage.setItem(cacheKey, JSON.stringify({ 
          videos: result.videos, 
          total: result.total, 
          totalPages: result.totalPages, 
          timestamp: Date.now() 
        }));
      } else {
        setError(result.error);
        setVideos([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (err) {
      setError('An error occurred while searching for videos.');
      setVideos([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [apiKey, perPage, orientation]);

  useEffect(() => {
    if (defaultQuery) {
      searchVideos(defaultQuery, 1);
    }
  }, []);

  const debouncedSearch = useCallback((value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchVideos(value, 1), 500);
  }, [searchVideos]);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setCurrentPage(1); 
    searchVideos(query, 1); 
  };

  const handleOrientationChange = (newOrientation) => { 
    setOrientation(newOrientation); 
    setCurrentPage(1); 
    searchVideos(query, 1, newOrientation); 
  };

  const handlePageChange = (page) => { 
    setCurrentPage(page); 
    searchVideos(query, page); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleKeywordClick = (keyword) => { 
    setQuery(keyword); 
    setCurrentPage(1); 
    searchVideos(keyword, 1); 
  };

  const handleCollectionClick = (keyword) => { 
    setQuery(keyword); 
    setCurrentPage(1); 
    searchVideos(keyword, 1); 
  };

  const downloadVideo = (url) => { 
    if (url) window.open(url, '_blank'); 
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video Player Modal
  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition">
            <i className="fas fa-times text-lg"></i>
          </button>
          
          <div className="aspect-video bg-black">
            {video.videoUrl ? (
              <video 
                src={video.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
                poster={video.thumbnail}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <i className="fas fa-video text-4xl"></i>
                <p className="ml-3">No video available</p>
              </div>
            )}
          </div>
          
          <div className="p-4 text-white">
            <h3 className="text-lg font-semibold">{video.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
              <span><i className="fas fa-user mr-1"></i> {video.user}</span>
              <span><i className="fas fa-clock mr-1"></i> {formatDuration(video.duration)}</span>
              <span><i className="fas fa-expand mr-1"></i> {video.width}x{video.height}</span>
            </div>
            <button 
              onClick={() => downloadVideo(video.videoUrl)}
              className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Download Video
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              <i className="fas fa-video text-indigo-400"></i> DFY Video Library
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            Video <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Story</span> Assets
          </h1>
          <p className="text-white/50 text-base mb-6">Find cinematic video clips for your next viral project.</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/20 transition">
              <div className="flex items-center flex-1 px-3">
                <i className="fas fa-search text-white/30 text-sm"></i>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { 
                    setQuery(e.target.value); 
                    debouncedSearch(e.target.value); 
                  }}
                  placeholder="Search cinematic videos..."
                  className="w-full bg-transparent border-0 px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none"
                />
              </div>
              <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2 whitespace-nowrap">
                <i className="fas fa-wand-magic-sparkles"></i> Instant Search
              </button>
            </div>

            {/* Keyword Pills */}
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

            {/* Orientation Filter */}
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

        {/* Stats */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-play text-indigo-400"></i>
            </div>
            <div>
              <div className="text-xl font-bold text-white">10M+</div>
              <div className="text-xs text-white/40">Premium Videos</div>
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition">
                  <i className="fas fa-play text-white text-xl ml-1"></i>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="text-white text-sm font-semibold truncate">{collection.title}</div>
                <div className="text-white/50 text-xs">{collection.count}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div>
        {/* Stats Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-100/80 px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-video text-indigo-500"></i>
            <span className="font-semibold text-gray-800">
              {total > 0 ? query.charAt(0).toUpperCase() + query.slice(1) : 'Ready To Discover'}
            </span>
            <span className="text-sm text-gray-400">{total > 0 ? `${total} videos found` : 'Search or choose a collection'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <i className="fas fa-layer-group"></i> {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Searching for videos...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h4>
            <p className="text-sm text-gray-400 max-w-md">{error}</p>
            <button onClick={() => searchVideos(query, 1)} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition">
              <i className="fas fa-rotate mr-2"></i> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && videos.length === 0 && searchPerformed && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-video-slash text-gray-300 text-2xl"></i>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Videos Found</h4>
            <p className="text-sm text-gray-400 max-w-md">Try searching with different keywords or choose a collection above.</p>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="group relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-800 relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    loading="lazy" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
                      <i className="fas fa-play text-white text-2xl ml-1"></i>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs font-medium">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-white">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{video.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="truncate"><i className="fas fa-user mr-1"></i> {video.user}</span>
                    <span><i className="fas fa-expand mr-1"></i> {video.width}x{video.height}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
};

export default VideoLibrary;