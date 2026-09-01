import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, connectionService } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { playNotificationSound } from '../utils/sound';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Notification sound preference toggle (default: true)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('careerlink_notification_sound') !== 'false';
  });

  const isInitialLoadRef = useRef(true);
  const seenNotificationIdsRef = useRef(new Set());

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('careerlink_notification_sound', next ? 'true' : 'false');
      if (next) {
        playNotificationSound();
      }
      return next;
    });
  };

  const playChime = () => {
    playNotificationSound();
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      if (data.success) {
        // If not initial load, detect if there are genuinely new unread notifications
        if (!isInitialLoadRef.current) {
          const newItems = data.notifications.filter(
            (n) => !seenNotificationIdsRef.current.has(n._id) && !n.isRead
          );
          if (newItems.length > 0 && soundEnabled) {
            playNotificationSound();
          }
        }

        // Register all current IDs into seen set
        data.notifications.forEach((n) => seenNotificationIdsRef.current.add(n._id));
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
        isInitialLoadRef.current = false;
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  }, [isAuthenticated, soundEnabled]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time Socket.IO notification listener
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeNotification = (notif) => {
      if (!notif) return;
      const notifId = notif._id || notif.id || `temp-${Date.now()}`;

      // Guard: only play audio & toast for genuinely new incoming socket notification
      if (!seenNotificationIdsRef.current.has(notifId)) {
        seenNotificationIdsRef.current.add(notifId);
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        if (soundEnabled) {
          playNotificationSound();
        }

        showToast(notif.message || notif.title || 'New notification received!', 'info');
      }
    };

    socket.on('notification:new', handleRealtimeNotification);
    socket.on('new_notification', handleRealtimeNotification);

    return () => {
      socket.off('notification:new', handleRealtimeNotification);
      socket.off('new_notification', handleRealtimeNotification);
    };
  }, [socket, soundEnabled]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptConnection = async (connectionId, notificationId) => {
    try {
      await connectionService.acceptRequest(connectionId);
      showToast('Connection accepted!', 'success');
      if (notificationId) {
        markAsRead(notificationId);
      }
      fetchNotifications();
    } catch (err) {
      showToast(err.message || 'Failed to accept connection', 'error');
    }
  };

  const handleRejectConnection = async (connectionId, notificationId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      showToast('Connection request ignored', 'info');
      if (notificationId) {
        markAsRead(notificationId);
      }
      fetchNotifications();
    } catch (err) {
      showToast(err.message || 'Failed to reject connection', 'error');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastMessage,
        soundEnabled,
        toggleSound,
        playChime,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
        handleAcceptConnection,
        handleRejectConnection,
      }}
    >
      {children}

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="px-5 py-3.5 rounded-2xl bg-slate-950/90 border border-pro-500/40 shadow-2xl backdrop-blur-xl text-white text-xs font-bold flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-pro-400 animate-ping" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
