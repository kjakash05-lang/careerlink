import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { postService, uploadService } from '../../services/api';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();

  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // { url, file, isUploading }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);

    // Upload selected files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select image files only (PNG, JPG, WebP).');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file must be under 10MB.');
        continue;
      }

      // Add temporary preview while uploading
      const tempPreview = URL.createObjectURL(file);
      const tempItem = { id: Date.now() + Math.random(), url: tempPreview, isUploading: true };
      setSelectedImages((prev) => [...prev, tempItem]);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const data = await uploadService.uploadImage(formData);
        if (data.success && data.url) {
          setSelectedImages((prev) =>
            prev.map((img) =>
              img.id === tempItem.id ? { ...img, url: data.url, isUploading: false } : img
            )
          );
        }
      } catch (err) {
        setError(err.message || 'Image upload failed');
        setSelectedImages((prev) => prev.filter((img) => img.id !== tempItem.id));
      }
    }
  };

  const handleRemoveImage = (imgId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedImages.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const media = selectedImages
        .filter((img) => !img.isUploading && img.url)
        .map((img) => ({
          type: 'image',
          url: img.url,
        }));

      const payload = {
        content: content.trim(),
        media,
      };

      const res = await postService.createPost(payload);
      if (res.success && res.post) {
        setContent('');
        setSelectedImages([]);
        showToast('Post published to CareerLink community!', 'success');
        onPostCreated(res.post);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Header */}
        <div className="flex items-center gap-3">
          <Avatar
            src={profile?.avatar}
            alt={profile?.fullName || user?.email}
            size="md"
          />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {profile?.fullName || user?.email}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {profile?.headline || (user?.role === 'recruiter' ? 'Recruiter' : 'Professional')}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Content Textarea */}
        <div className="relative">
          <textarea
            rows={5}
            placeholder="What do you want to talk about? Share an engineering breakthrough, career update, or project..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm bg-transparent border-0 focus:ring-0 resize-none p-0 focus:outline-none leading-relaxed"
            autoFocus
          />
          <div className="text-right text-[11px] text-slate-400">
            {content.length}/3000
          </div>
        </div>

        {/* Selected Images Preview Grid */}
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {selectedImages.map((img) => (
              <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-36 bg-slate-100 dark:bg-slate-800">
                <img
                  src={img.url}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                {img.isUploading ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-pro-600 dark:text-pro-400" />
              <span>Add Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="pro-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
              className="pro-btn-primary text-xs px-5 py-2 flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
