import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  CheckCheck,
  Clock,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { messageService, connectionService } from '../../services/api';
import Avatar from '../../components/common/Avatar';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const targetUserId = searchParams.get('userId');

  // Load conversations & connections
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      try {
        const [convRes, connRes] = await Promise.all([
          messageService.getConversations(),
          connectionService.getMyConnections(),
        ]);

        if (convRes.success) {
          setConversations(convRes.conversations);
        }
        if (connRes.success) {
          setConnections(connRes.connections.map((c) => c.user));
        }

        // Preselect conversation if targetUserId passed
        if (targetUserId) {
          const matchUser = connRes.success
            ? connRes.connections.find((c) => (c.user?._id || c.user?.id) === targetUserId)?.user
            : null;
          if (matchUser) {
            setSelectedUser(matchUser);
          }
        } else if (convRes.success && convRes.conversations.length > 0) {
          setSelectedUser(convRes.conversations[0].otherUser);
        }
      } catch (err) {
        console.error('Failed to load messaging data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, [targetUserId]);

  // Load message thread when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;
    const fetchThread = async () => {
      try {
        const res = await messageService.getMessagesWithUser(selectedUser._id || selectedUser.id);
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        showToast(err.message || 'Could not fetch messages', 'error');
      }
    };

    fetchThread();
  }, [selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket.IO message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        selectedUser &&
        (msg.sender._id === (selectedUser._id || selectedUser.id) ||
          msg.sender.id === (selectedUser._id || selectedUser.id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update conversations list timestamp
      setConversations((prev) =>
        prev.map((conv) => {
          if (
            (conv.otherUser?._id || conv.otherUser?.id) === (msg.sender._id || msg.sender.id)
          ) {
            return { ...conv, lastMessage: msg, lastMessageAt: new Date() };
          }
          return conv;
        })
      );
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser || isSending) return;

    const recipientId = selectedUser._id || selectedUser.id;
    const textToSend = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      const res = await messageService.sendMessage({
        recipientId,
        content: textToSend,
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
      setMessageText(textToSend); // Restore text on failure
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="pro-card h-[82vh] overflow-hidden flex flex-col md:flex-row shadow-lg border-slate-200 dark:border-slate-800">
        {/* Left: Conversations & Connections Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pro-600 dark:text-pro-400" />
              <span>Messaging</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Direct chat with verified accepted connections.
            </p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const u = conv.otherUser;
                if (!u) return null;
                const p = u.profile || {};
                const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
                const isSelected = selectedUser && (selectedUser._id || selectedUser.id) === (u._id || u.id);

                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-slate-850 border-l-4 border-l-pro-600 shadow-xs'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Avatar src={p.avatar} alt={name} size="md" />
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.lastMessage?.content || p.headline || 'Connected'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-block px-1.5 py-0.2 bg-pro-600 text-white rounded-full text-[10px] font-bold mt-1">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No active conversations</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Start a chat from your connections below!
                </p>
              </div>
            )}

            {/* Quick Connected Peers List */}
            {connections.length > 0 && (
              <div className="p-3 bg-white/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Connected Network ({connections.length})
                </p>
                <div className="space-y-1">
                  {connections.map((u) => {
                    const p = u?.profile || {};
                    const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
                    return (
                      <button
                        key={u?._id || u?.id}
                        onClick={() => setSelectedUser(u)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Avatar src={p.avatar} alt={name} size="xs" />
                        <span className="font-semibold truncate">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedUser.profile?.avatar}
                    alt={selectedUser.profile?.fullName || selectedUser.email}
                    size="md"
                    online
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedUser.profile?.fullName || selectedUser.email}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {selectedUser.profile?.headline || (selectedUser.role === 'recruiter' ? 'Recruiter' : 'Professional')}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/profile/${selectedUser.profile?._id || selectedUser._id || selectedUser.id}`}
                  className="pro-btn-secondary text-xs py-1.5 px-3"
                >
                  View Profile
                </Link>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/40">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = (msg.sender?._id || msg.sender?.id || msg.sender) === (user.id || user._id);
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-pro-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              isMe ? 'text-pro-200' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <p className="font-bold text-slate-600 dark:text-slate-400">No messages yet</p>
                    <p className="mt-1">Send a greeting to start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="pro-input text-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="pro-btn-primary p-2.5 rounded-xl disabled:opacity-40 shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Conversation Selected</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Choose a peer from the left panel to begin chatting, or visit any connected user's profile to message them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
