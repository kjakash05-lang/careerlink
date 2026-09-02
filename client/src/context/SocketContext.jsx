import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      if (import.meta.env.DEV) {
        socketUrl = 'http://localhost:5000';
      } else if (typeof window !== 'undefined') {
        socketUrl = window.location.origin;
      } else {
        socketUrl = '/';
      }
    }

    const effectiveUserId = (user.id || user._id || '').toString();
    const storedToken = token || localStorage.getItem('careerlink_token') || '';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
      withCredentials: true,
      auth: {
        token: storedToken,
      },
      query: {
        token: storedToken,
        userId: effectiveUserId,
      },
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', socketUrl);
      newSocket.emit('join', effectiveUserId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id, user?._id, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
