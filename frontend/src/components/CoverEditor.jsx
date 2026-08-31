// frontend/src/components/CoverEditor.jsx
import React, { useState } from 'react';
import { X, Sparkles, Download, RefreshCw, Eye, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CoverEditor = ({ productId, product, onClose, onCoverUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const generateCover = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/products/${productId}/generate-cover`);
      const data = response.data.data;
      setCoverImage(data.imageUrl);
      toast.success('Cover image generated!');
    } catch (error) {
      console.error('Error generating cover:', error);
      toast.error('Failed to generate cover image');
    } finally {
      setGenerating(false);
    }
  };

  const mergeCover = async () => {
    if (!coverImage) {
      toast.error('Please generate a cover image first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/products/${productId}/merge-cover`, {
        imageUrl: coverImage,
      });
      
      toast.success('Cover merged successfully!');
      if (onCoverUpdated) {
        onCoverUpdated(response.data.data);
      }
      onClose();
    } catch (error) {
      console.error('Error merging cover:', error);
      toast.error('Failed to merge cover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
              <Sparkles size={22} className="text-[#FACC15]" />
              Cover Page Editor
            </h2>
            <p className="text-sm text-[#6B7280]">
              Generate a new cover image and merge it with your PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F8F8F6] rounded-xl transition"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">
                Cover Preview
              </h3>
              <div className="bg-[#F8F8F6] rounded-2xl p-4 flex items-center justify-center min-h-[300px] border-2 border-dashed border-[#E5E7EB]">
                {coverImage ? (
                  <div className="relative group">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="max-h-[400px] rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <button
                        onClick={() => setPreviewMode(true)}
                        className="px-4 py-2 bg-white rounded-xl text-[#111111] font-medium flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Preview Full
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#6B7280]">
                    <div className="text-6xl mb-3">🖼️</div>
                    <p>No cover image generated yet</p>
                    <p className="text-xs">Click "Generate Cover" below</p>
                  </div>
                )}
              </div>

              {/* Full Preview Modal */}
              {previewMode && coverImage && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                  <div className="relative max-w-2xl w-full">
                    <button
                      onClick={() => setPreviewMode(false)}
                      className="absolute -top-12 right-0 text-white hover:text-[#FACC15] transition"
                    >
                      <X size={24} />
                    </button>
                    <img
                      src={coverImage}
                      alt="Full Preview"
                      className="w-full rounded-2xl shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">
                Controls
              </h3>

              {/* Product Info */}
              <div className="bg-[#F8F8F6] rounded-xl p-4">
                <div className="text-xs text-[#6B7280]">Product</div>
                <div className="font-medium text-[#111111]">{product?.title}</div>
                <div className="text-xs text-[#6B7280] mt-1">
                  {product?.productType} • {product?.niche}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateCover}
                disabled={generating}
                className="w-full py-3 bg-[#FACC15] text-[#111111] font-semibold rounded-xl hover:bg-[#e5b800] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Cover
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-[#6B7280]">OR</span>
                </div>
              </div>

              {/* Upload Custom Image */}
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#FACC15] transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="coverUpload"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setCoverImage(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="coverUpload" className="cursor-pointer">
                  <div className="text-3xl mb-2">📤</div>
                  <p className="text-sm font-medium text-[#111111]">Upload custom image</p>
                  <p className="text-xs text-[#6B7280]">PNG, JPG, or WebP</p>
                </label>
              </div>

              {/* Merge Button */}
              <button
                onClick={mergeCover}
                disabled={loading || !coverImage}
                className="w-full py-3 bg-[#111111] text-white font-semibold rounded-xl hover:bg-[#222] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Merge with PDF
                  </>
                )}
              </button>

              <p className="text-xs text-[#6B7280] text-center">
                This will replace the current cover page in your PDF
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverEditor;