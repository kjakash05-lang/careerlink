import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/api';
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
        // Play sample chime so user hears confirmation
        playNotificationSound();
      }
      return next;
    });
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
        setUnreadCount(data.unreadCount);
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
      
      // Guard: only play for genuinely new notification
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

    socket.on('new_notification', handleRealtimeNotification);

    return () => {
      socket.off('new_notification', handleRealtimeNotification);
    };
  }, [socket, soundEnabled]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
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
    } catch (err) {
      console.error(err);
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
        playChime: playNotificationSound,
        showToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce transition-all duration-300">
          <div className="liquid-glass text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-pro-400 animate-ping" />
            <span className="text-xs font-semibold">{toastMessage.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
