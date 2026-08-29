import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Edit3,
  Send,
  Check,
  Sparkles,
  Repeat2,
  Quote,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { postService } from '../../services/api';
import Avatar from '../common/Avatar';
import RepostModal from './RepostModal';

const PostCard = ({ post, onPostDeleted, onPostUpdated, onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || (post.likes ? post.likes.length : 0));
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || (post.reposts ? post.reposts.length : 0));
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');

  const repostMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (repostMenuRef.current && !repostMenuRef.current.contains(e.target)) {
        setRepostMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary post author
  const authorProfile = post.author?.profile || {};
  const authorName = authorProfile.fullName || `${authorProfile.firstName || ''} ${authorProfile.lastName || ''}`.trim() || 'CareerLink Member';
  const authorHeadline = authorProfile.headline || (post.author?.role === 'recruiter' ? 'Recruiter' : 'Professional');
  const authorAvatar = authorProfile.avatar;
  const authorId = post.author?._id || post.author?.id;

  // Embedded original post (if this post is a repost)
  const isRepost = post.isRepost && post.originalPost;
  const originalPost = isRepost ? post.originalPost : null;
  const originalAuthorProfile = originalPost?.author?.profile || {};
  const originalAuthorName = originalAuthorProfile.fullName || `${originalAuthorProfile.firstName || ''} ${originalAuthorProfile.lastName || ''}`.trim() || 'CareerLink Member';
  const originalAuthorHeadline = originalAuthorProfile.headline || 'Professional';
  const originalAuthorAvatar = originalAuthorProfile.avatar;
  const originalAuthorId = originalPost?.author?._id || originalPost?.author?.id;

  const isAuthorOrAdmin = user && (user.id === authorId || user._id === authorId || user.role === 'admin');
  const displayContent = post.repostCommentary || post.content || '';
  const isLongContent = displayContent.length > 320;

  const handleLike = async () => {
    if (!user) {
      showToast('Please log in to like posts', 'info');
      return;
    }
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await postService.likePost(post._id);
    } catch (err) {
      // Revert
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      showToast('Failed to update like', 'error');
    }
  };

  const handleSimpleRepost = async () => {
    if (!user) {
      showToast('Please log in to repost', 'info');
      return;
    }
    setRepostMenuOpen(false);
    try {
      const targetId = isRepost ? originalPost._id : post._id;
      const res = await postService.repostPost(targetId, {});
      if (res.success) {
        setRepostsCount((prev) => prev + 1);
        showToast('Reposted to your feed!', 'success');
        if (onPostCreated) {
          onPostCreated(res.post);
        }
      }
    } catch (err) {
      showToast(err.message || 'Could not repost', 'error');
    }
  };

  const handleSave = async () => {
    if (!user) {
      showToast('Please sign in to save posts', 'info');
      return;
    }
    setIsSaved(!isSaved);
    try {
      await postService.savePost(post._id);
      showToast(isSaved ? 'Post removed from saved' : 'Post saved to your bookmarks', 'success');
    } catch (err) {
      setIsSaved(isSaved);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed#post-${post._id}`;
    navigator.clipboard.writeText(url);
    showToast('Post link copied to clipboard!', 'success');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await postService.deletePost(post._id);
      showToast('Post deleted', 'info');
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      showToast(err.message || 'Could not delete post', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      const res = await postService.updatePost(post._id, { content: editContent.trim() });
      if (res.success) {
        post.content = editContent.trim();
        setIsEditing(false);
        setMenuOpen(false);
        showToast('Post updated successfully', 'success');
        if (onPostUpdated) onPostUpdated(res.post);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update post', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      const res = await postService.addComment(post._id, commentInput.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setCommentInput('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div id={`post-${post._id}`} className="liquid-glass p-5 mb-4 border border-white/15 transition-all rounded-3xl">
      {/* Repost Header Indicator */}
      {isRepost && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 pb-3 mb-3 border-b border-white/10">
          <Repeat2 className="w-3.5 h-3.5 text-pro-400" />
          <Link to={`/profile/${authorId}`} className="hover:underline hover:text-white">
            {authorName}
          </Link>
          <span className="text-slate-400 font-normal">reposted</span>
        </div>
      )}

      {/* Post Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <Link to={`/profile/${authorId}`} className="flex items-center gap-3 group">
          <Avatar src={authorAvatar} alt={authorName} size="md" />
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-pro-400 transition-colors">
              {authorName}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-1">{authorHeadline}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </Link>

        {/* Options Menu for Author/Admin */}
        {isAuthorOrAdmin && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 liquid-glass rounded-xl shadow-2xl border border-white/20 py-1.5 z-20">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Body Content or Inline Edit */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-2 mb-3">
          <textarea
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="pro-input text-xs"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="pro-btn-secondary text-xs py-1 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pro-btn-primary text-xs py-1 px-3"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        displayContent && (
          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-line mb-3">
            <p>{isLongContent && !isExpanded ? `${displayContent.slice(0, 320)}...` : displayContent}</p>
            {isLongContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-pro-400 hover:text-pro-300 font-semibold text-xs mt-1 inline-block"
              >
                {isExpanded ? 'Show less' : '...see more'}
              </button>
            )}
          </div>
        )
      )}

      {/* Embedded Original Post Container for Reposts */}
      {isRepost && originalPost && (
        <div className="mb-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all">
          <Link to={`/profile/${originalAuthorId}`} className="flex items-center gap-2.5 mb-2.5 group">
            <Avatar src={originalAuthorAvatar} alt={originalAuthorName} size="sm" />
            <div className="overflow-hidden flex-1">
              <h5 className="text-xs font-bold text-white group-hover:text-pro-400 transition-colors truncate">
                {originalAuthorName}
              </h5>
              <p className="text-[10px] text-slate-400 truncate">{originalAuthorHeadline}</p>
            </div>
            <span className="text-[10px] text-slate-500">
              {originalPost.createdAt ? formatDistanceToNow(new Date(originalPost.createdAt), { addSuffix: true }) : ''}
            </span>
          </Link>

          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line mb-2.5">
            {originalPost.content}
          </p>

          {originalPost.media && originalPost.media.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
              <img
                src={originalPost.media[0].url || originalPost.media[0]}
                alt="Original Post Media"
                className="w-full max-h-72 object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Media Images Gallery for standard posts */}
      {!isRepost && post.media && post.media.length > 0 && (
        <div className="mb-3.5 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
          <div className={`grid gap-1 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((imgItem, i) => (
              <img
                key={i}
                src={imgItem.url || imgItem}
                alt="Post Media"
                className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity"
              />
            ))}
          </div>
        </div>
      )}

      {/* Reactions & Reposts Count Stats */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2.5 mb-1 border-b border-white/10">
        <span className="flex items-center gap-1.5">
          <span className="p-1 rounded-full bg-pro-600/40 text-pro-300">
            <ThumbsUp className="w-2.5 h-2.5" />
          </span>
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        </span>
        <div className="flex items-center gap-3">
          <span>{comments.length} comments</span>
          <span>·</span>
          <span>{repostsCount} reposts</span>
          <span>·</span>
          <span>{post.sharesCount || 0} shares</span>
        </div>
      </div>

      {/* Interactive Action Buttons: Like | Comment | Repost | Share | Save */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pt-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors ${
            isLiked ? 'text-pro-400 font-bold' : ''
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-pro-400 text-pro-400' : ''}`} />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Repost Button with Dropdown Options */}
        <div className="relative" ref={repostMenuRef}>
          <button
            onClick={() => setRepostMenuOpen(!repostMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 hover:text-pro-300 transition-colors"
          >
            <Repeat2 className="w-4 h-4" />
            <span>Repost</span>
          </button>

          {repostMenuOpen && (
            <div className="absolute left-0 mt-1 w-52 liquid-glass rounded-2xl shadow-2xl border border-white/20 p-1.5 z-30 animate-fadeIn text-xs">
              <button
                onClick={handleSimpleRepost}
                className="w-full text-left p-2 rounded-xl hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
              >
                <Repeat2 className="w-3.5 h-3.5 text-pro-400" />
                <div>
                  <p className="font-bold">Repost</p>
                  <p className="text-[9.5px] text-slate-400">Instantly share to your feed</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setRepostMenuOpen(false);
                  setRepostModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <p className="font-bold">Repost with your thoughts</p>
                  <p className="text-[9.5px] text-slate-400">Add commentary and insights</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors ${
            isSaved ? 'text-amber-400 font-bold' : ''
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-3">
          {/* Add Comment Input */}
          {user && (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <Avatar
                src={user.profile?.avatar}
                alt={user.profile?.fullName || user.email}
                size="sm"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 liquid-glass rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all border border-white/15"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim() || isSubmittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-pro-400 hover:scale-110 disabled:opacity-30 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {comments.map((comment, idx) => {
              const cAuthor = comment.author?.profile || {};
              const cName = cAuthor.fullName || `${cAuthor.firstName || ''} ${cAuthor.lastName || ''}`.trim() || 'Member';
              const cHeadline = cAuthor.headline || 'Member';
              return (
                <div key={idx} className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                  <Avatar src={cAuthor.avatar} alt={cName} size="xs" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{cName}</span>
                      <span className="text-[10px] text-slate-400">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{cHeadline}</p>
                    <p className="text-slate-200 mt-1">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Repost with Thoughts Modal */}
      <RepostModal
        isOpen={repostModalOpen}
        onClose={() => setRepostModalOpen(false)}
        post={post}
        onRepostSuccess={(newRepost, origId, newOrigCount) => {
          setRepostsCount((prev) => prev + 1);
          if (onPostCreated) {
            onPostCreated(newRepost);
          }
        }}
      />
    </div>
  );
};

export default PostCard;
