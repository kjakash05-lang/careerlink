import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Send, Image } from 'lucide-react';
import { articleService, uploadService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and article content are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        coverImage: coverImage.trim(),
        content: content.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await articleService.createArticle(payload);
      if (res.success && res.article) {
        showToast('Article published successfully!', 'success');
        navigate(`/articles/${res.article._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/articles"
        className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 hover:underline mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Articles</span>
      </Link>

      <div className="pro-card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-pro-600" />
          <span>Publish Thought Leadership Article</span>
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Share your technical architecture patterns, career learnings, and engineering guides with the community.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scaling Distributed Microservices: Lessons from Production"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="pro-input text-base font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="pro-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Architecture, Performance, Cloud"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="pro-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Content (Markdown supported) *</label>
            <textarea
              rows={14}
              required
              placeholder="# Introduction&#10;&#10;Explain the problem and high-level architectural overview...&#10;&#10;## Key Learnings&#10;1. Point one&#10;2. Point two"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="pro-input text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/articles')}
              className="pro-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pro-btn-primary text-xs px-6 py-2 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;
