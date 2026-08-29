import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ThumbsUp,
  MessageCircle,
  Clock,
  ArrowLeft,
  Share2,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { articleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../../components/common/Avatar';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const res = await articleService.getArticleById(id);
        if (res.success && res.article) {
          setArticle(res.article);
          setIsLiked(res.article.isLiked || false);
          setLikesCount(res.article.likes ? res.article.likes.length : 0);
          setComments(res.article.comments || []);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      showToast('Please sign in to like articles', 'info');
      return;
    }
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await articleService.likeArticle(article._id);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const res = await articleService.addComment(article._id, commentText.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setCommentText('');
        showToast('Comment added!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to comment', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="pro-card h-80 animate-pulse bg-slate-200" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Article Not Found</h3>
        <Link to="/articles" className="pro-btn-primary text-xs py-2">Back to Articles</Link>
      </div>
    );
  }

  const author = article.author?.profile || {};
  const authorName = author.fullName || 'Author';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/articles"
        className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 hover:underline mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Articles</span>
      </Link>

      <article className="pro-card p-6 sm:p-10 space-y-6">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden max-h-[420px] bg-slate-100 border border-slate-200">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Metadata */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <Link to={`/profile/${author._id || article.author?._id}`} className="flex items-center gap-3">
              <Avatar src={author.avatar} alt={authorName} size="md" />
              <div>
                <p className="text-sm font-bold text-slate-900 hover:text-pro-600">{authorName}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{author.headline}</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime || 3} min read</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-line border-t border-b border-slate-100 py-6">
          {article.content}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isLiked ? 'bg-pro-50 text-pro-600 border border-pro-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-pro-600' : ''}`} />
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            {comments.length} Comments
          </span>
        </div>

        {/* Comments Thread */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Discussion ({comments.length})</h3>

          {user && (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Share your thoughts on this article..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="pro-input text-xs flex-1"
              />
              <button type="submit" className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
            </form>
          )}

          <div className="space-y-3 pt-2">
            {comments.map((c, idx) => {
              const cAuthor = c.author?.profile || {};
              const cName = cAuthor.fullName || 'Member';
              return (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar src={cAuthor.avatar} alt={cName} size="xs" />
                    <span className="font-bold text-slate-900">{cName}</span>
                    <span className="text-[10px] text-slate-400">
                      {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-slate-700 pl-8">{c.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetailPage;
