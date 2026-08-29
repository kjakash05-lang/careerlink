import React, { useState } from 'react';
import { Repeat2, Send, Loader2, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { postService } from '../../services/api';

const RepostModal = ({ isOpen, onClose, post, onRepostSuccess }) => {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  // If this post is already a repost, point to original post
  const originalPost = post.isRepost && post.originalPost ? post.originalPost : post;
  const originalAuthor = originalPost.author?.profile || {};
  const originalAuthorName = originalAuthor.fullName || `${originalAuthor.firstName || ''} ${originalAuthor.lastName || ''}`.trim() || 'CareerLink Member';
  const originalAuthorHeadline = originalAuthor.headline || 'Professional';

  const userDisplayName = profile?.fullName || user?.profile?.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'You');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await postService.repostPost(originalPost._id, {
        commentary: commentary.trim(),
      });
      if (res.success) {
        showToast('Post reposted with your thoughts to your feed!', 'success');
        setCommentary('');
        onClose();
        if (onRepostSuccess) {
          onRepostSuccess(res.post, originalPost._id, res.originalRepostsCount);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to repost', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Repost with your thoughts" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Current User Header */}
        <div className="flex items-center gap-2.5">
          <Avatar src={profile?.avatar} alt={userDisplayName} size="sm" />
          <div>
            <p className="font-bold text-white text-xs">{userDisplayName}</p>
            <p className="text-[10px] text-slate-400">Posting publicly to your network</p>
          </div>
        </div>

        {/* User Commentary Textarea */}
        <div>
          <textarea
            rows={3}
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            placeholder="Add your thoughts or insights about this post..."
            className="pro-input text-xs w-full resize-none placeholder-slate-400"
            autoFocus
          />
        </div>

        {/* Embedded Original Post Preview */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/15 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar src={originalAuthor.avatar} alt={originalAuthorName} size="xs" />
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-white text-xs truncate">{originalAuthorName}</p>
              <p className="text-[10px] text-slate-400 truncate">{originalAuthorHeadline}</p>
            </div>
          </div>

          <p className="text-slate-200 text-xs line-clamp-3 leading-relaxed whitespace-pre-line">
            {originalPost.content}
          </p>

          {originalPost.media && originalPost.media.length > 0 && (
            <div className="rounded-xl overflow-hidden max-h-36 border border-white/10">
              <img
                src={originalPost.media[0].url || originalPost.media[0]}
                alt="Post Media"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="pro-btn-secondary py-1.5 px-3 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="pro-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reposting...</span>
              </>
            ) : (
              <>
                <Repeat2 className="w-3.5 h-3.5" />
                <span>Repost</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RepostModal;
