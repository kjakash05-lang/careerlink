import React from 'react';
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
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="w-4 h-4 text-pro-400" />;
      case 'post_like':
        return <ThumbsUp className="w-4 h-4 text-pro-400" />;
      case 'post_comment':
      case 'new_message':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'skill_endorsement':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'job_application':
      case 'application_status':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

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
            {unreadCount > 0 ? `${unreadCount} unread updates` : "You're all caught up!"}
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
      <div className="liquid-glass divide-y divide-white/10 rounded-3xl overflow-hidden border border-white/15">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const sender = notif.sender?.profile || {};
            const senderName = sender.fullName || 'Someone';
            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                  notif.isRead
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-pro-950/40 hover:bg-pro-950/60 border-l-4 border-l-pro-500'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/10 border border-white/10 shadow-xs shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title || 'Notification'}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5">{notif.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="font-bold text-slate-200 text-sm">No notifications</p>
            <p className="text-xs text-slate-400 mt-0.5">You're all caught up.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
