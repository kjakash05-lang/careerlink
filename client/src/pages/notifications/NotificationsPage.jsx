import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  UserPlus,
  ThumbsUp,
  MessageCircle,
  Briefcase,
  Star,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Check,
  X,
  Repeat2,
  Clock,
  Loader2,
  MessageSquare,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../../components/common/Avatar';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    toggleSound,
    playChime,
    handleAcceptConnection,
    handleRejectConnection,
  } = useNotifications();

  // Track loading / processed state per connection/notification ID
  const [processingId, setProcessingId] = useState(null);
  const [processingType, setProcessingType] = useState(null); // 'accept' | 'ignore'
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [ignoredIds, setIgnoredIds] = useState(new Set());

  const onAccept = async (e, connectionId, notifId) => {
    e.stopPropagation();
    if (processingId) return;
    setProcessingId(notifId);
    setProcessingType('accept');
    try {
      await handleAcceptConnection(connectionId, notifId);
      setAcceptedIds((prev) => new Set([...prev, notifId]));
    } finally {
      setProcessingId(null);
      setProcessingType(null);
    }
  };

  const onIgnore = async (e, connectionId, notifId) => {
    e.stopPropagation();
    if (processingId) return;
    setProcessingId(notifId);
    setProcessingType('ignore');
    try {
      await handleRejectConnection(connectionId, notifId);
      setIgnoredIds((prev) => new Set([...prev, notifId]));
    } finally {
      setProcessingId(null);
      setProcessingType(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="w-4 h-4 text-pro-400" />;
      case 'post_like':
        return <ThumbsUp className="w-4 h-4 text-pro-400" />;
      case 'post_comment':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'post_repost':
        return <Repeat2 className="w-4 h-4 text-indigo-400" />;
      case 'skill_endorsement':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'job_application':
      case 'application_status':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter out locally ignored notifications
  const visibleNotifications = notifications.filter((n) => !ignoredIds.has(n._id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-pro-400" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread update(s)` : "You're all caught up!"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Notification Sound Toggle Control */}
          <button
            onClick={toggleSound}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
              soundEnabled
                ? 'bg-pro-500/20 text-pro-300 border-pro-400/40 hover:bg-pro-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle 4-second notification bell sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Notification Sounds: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Test Sound Button */}
          {soundEnabled && (
            <button
              onClick={() => playChime()}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Test 4-second notification bell sound"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-pro-400" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Stream */}
      <div className="liquid-glass divide-y divide-white/10 rounded-3xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl">
        {visibleNotifications.length > 0 ? (
          visibleNotifications.map((notif) => {
            const sender = notif.sender?.profile || {};
            const senderName = sender.fullName || `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'CareerLink Member';
            const senderHeadline = sender.headline || '';
            const senderAvatar = sender.avatar;
            const senderId = sender._id || notif.sender?._id || notif.sender;
            const isConnRequest = notif.type === 'connection_request';
            const isConnAccepted = notif.type === 'connection_accepted';
            const connectionId = notif.data?.connectionId || senderId;
            const isAccepted = acceptedIds.has(notif._id);
            const isProcessingThis = processingId === notif._id;

            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                className={`p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  notif.isRead
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-pro-950/40 hover:bg-pro-950/60 border-l-4 border-l-pro-500'
                }`}
              >
                <div className="flex items-start gap-3.5 overflow-hidden flex-1">
                  {/* Sender Avatar */}
                  <Link to={`/profile/${senderId}`} className="shrink-0 group">
                    <Avatar
                      src={senderAvatar}
                      alt={senderName}
                      size="md"
                      className="ring-2 ring-white/20 group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="overflow-hidden flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs font-black text-white truncate">
                        {notif.title || (isConnAccepted ? 'Connection Accepted' : 'Notification')}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.createdAt
                          ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                          : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                      {notif.message}
                    </p>

                    {senderHeadline && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {senderHeadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* 1. Connection Request Action Buttons */}
                {isConnRequest && !isAccepted && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                    <button
                      onClick={(e) => onAccept(e, connectionId, notif._id)}
                      disabled={isProcessingThis}
                      className="px-4 py-1.5 rounded-xl bg-pro-600 hover:bg-pro-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pro-600/30 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingThis && processingType === 'accept' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => onIgnore(e, connectionId, notif._id)}
                      disabled={isProcessingThis}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-white/15 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingThis && processingType === 'ignore' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ignoring...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Ignore</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 2. State After Acceptance */}
                {isConnRequest && isAccepted && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </span>
                    <Link
                      to={`/messages?userId=${senderId}`}
                      className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-pro-400" />
                      <span>Message</span>
                    </Link>
                  </div>
                )}

                {/* 3. Connection Accepted Actions for Original Sender */}
                {isConnAccepted && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                    <Link
                      to={`/profile/${senderId}`}
                      className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5 text-pro-400" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      to={`/messages?userId=${senderId}`}
                      className="pro-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1 shadow-md shadow-pro-600/30"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-slate-500 opacity-60" />
            <p className="font-bold text-slate-200 text-sm">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">You're completely up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
