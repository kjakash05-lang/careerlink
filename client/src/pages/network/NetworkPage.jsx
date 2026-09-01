import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Check,
  X,
  UserCheck,
  MessageSquare,
  Sparkles,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { connectionService } from '../../services/api';
import Avatar from '../../components/common/Avatar';

const NetworkPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'connections' | 'requests'
  const [connections, setConnections] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const [connRes, pendingRes, suggRes] = await Promise.allSettled([
        connectionService.getMyConnections(),
        connectionService.getPendingRequests(),
        connectionService.getSuggestions(),
      ]);

      if (connRes.status === 'fulfilled' && connRes.value.success) {
        setConnections(connRes.value.connections);
      }
      if (pendingRes.status === 'fulfilled' && pendingRes.value.success) {
        setPendingReceived(pendingRes.value.received);
        setPendingSent(pendingRes.value.sent);
      }
      if (suggRes.status === 'fulfilled' && suggRes.value.success) {
        setSuggestions(suggRes.value.suggestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  // Live Socket.IO listener for real-time network changes across devices
  useEffect(() => {
    if (!socket) return;

    const handleConnectionUpdate = () => {
      fetchNetworkData();
    };

    socket.on('connection:updated', handleConnectionUpdate);
    socket.on('connection_updated', handleConnectionUpdate);

    return () => {
      socket.off('connection:updated', handleConnectionUpdate);
      socket.off('connection_updated', handleConnectionUpdate);
    };
  }, [socket]);

  const handleAcceptRequest = async (connectionId) => {
    try {
      await connectionService.acceptRequest(connectionId);
      showToast('Connection accepted!', 'success');
      fetchNetworkData();
    } catch (err) {
      showToast(err.message || 'Failed to accept', 'error');
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      showToast('Connection invitation ignored', 'info');
      fetchNetworkData();
    } catch (err) {
      showToast(err.message || 'Failed to reject', 'error');
    }
  };

  const handleCancelRequest = async (connectionId) => {
    try {
      await connectionService.cancelRequest(connectionId);
      showToast('Connection request withdrawn', 'info');
      fetchNetworkData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      await connectionService.sendRequest(targetUserId);
      showToast('Connection request sent!', 'success');
      setSuggestions((prev) => prev.filter((s) => s._id !== targetUserId));
      fetchNetworkData();
    } catch (err) {
      showToast(err.message || 'Failed to send request', 'error');
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm('Remove this user from your professional connections?')) return;
    try {
      await connectionService.removeConnection(userId);
      showToast('Connection removed', 'info');
      fetchNetworkData();
    } catch (err) {
      showToast(err.message || 'Could not remove connection', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="pro-card p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-tealAccent-400" />
            <span>My Professional Network</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Grow and nurture your network of verified engineers, founders, and recruiters.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
            <p className="text-xl font-black text-tealAccent-400">{connections.length}</p>
            <p className="text-[10px] text-slate-300 uppercase font-bold">Connections</p>
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
            <p className="text-xl font-black text-pro-400">{pendingReceived.length}</p>
            <p className="text-[10px] text-slate-300 uppercase font-bold">Invitations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'suggestions'
              ? 'border-pro-600 dark:border-pro-400 text-pro-600 dark:text-pro-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>People You May Know ({suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-pro-600 dark:border-pro-400 text-pro-600 dark:text-pro-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Pending Invitations ({pendingReceived.length + pendingSent.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'connections'
              ? 'border-pro-600 dark:border-pro-400 text-pro-600 dark:text-pro-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Connected Peers ({connections.length})</span>
        </button>
      </div>

      {/* Tab 1: People You May Know */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((u) => {
            const p = u.profile || {};
            const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Professional';
            return (
              <div key={u._id} className="pro-card p-5 text-center flex flex-col justify-between hover:border-pro-400 dark:hover:border-pro-500 transition-all">
                <div>
                  <div className="mb-3 flex justify-center">
                    <Avatar src={p.avatar} alt={name} size="xl" />
                  </div>
                  <Link to={`/profile/${p._id || u._id}`} className="font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 text-sm line-clamp-1">
                    {name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {p.headline || (u.role === 'recruiter' ? 'Recruiter' : 'Professional')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{p.location || 'Global'}</p>

                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-3">
                      {p.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                          {typeof s === 'string' ? s : s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleSendRequest(u._id)}
                    className="w-full pro-btn-primary text-xs py-1.5 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Pending Invitations */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Invitations */}
          <div className="pro-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Received Invitations ({pendingReceived.length})
            </h3>

            {pendingReceived.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingReceived.map((req) => {
                  const p = req.requester?.profile || {};
                  const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
                  return (
                    <div key={req._id} className="py-4 flex items-center justify-between gap-4">
                      <Link to={`/profile/${p._id || req.requester?._id}`} className="flex items-center gap-3">
                        <Avatar src={p.avatar} alt={name} size="md" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white hover:text-pro-600">{name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.headline}</p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="pro-btn-secondary text-xs py-1.5 px-3"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="pro-btn-primary text-xs py-1.5 px-4 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                You're all caught up! No incoming invitations at the moment.
              </div>
            )}
          </div>

          {/* Sent Invitations */}
          <div className="pro-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Sent Invitations ({pendingSent.length})
            </h3>

            {pendingSent.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingSent.map((req) => {
                  const p = req.recipient?.profile || {};
                  const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
                  return (
                    <div key={req._id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.avatar} alt={name} size="md" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.headline}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        className="pro-btn-secondary text-xs py-1.5 px-3 text-slate-500 hover:text-rose-600"
                      >
                        Withdraw
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No pending outgoing invitations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Connected Peers */}
      {activeTab === 'connections' && (
        <div className="pro-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Connected Peers ({connections.length})
          </h3>

          {connections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((c) => {
                const u = c.user;
                const p = u?.profile || {};
                const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
                return (
                  <div key={c.connectionId} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar src={p.avatar} alt={name} size="md" />
                        <div className="overflow-hidden">
                          <Link to={`/profile/${p._id || u?._id}`} className="font-bold text-slate-900 dark:text-white hover:text-pro-600 text-sm truncate block">
                            {name}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.headline || 'Professional'}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">{p.location || 'Location'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/messages?userId=${u?._id || u?.id}`}
                        className="pro-btn-primary text-xs py-1 px-3 flex items-center gap-1 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </Link>

                      <button
                        onClick={() => handleRemoveConnection(u?._id || u?.id)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No connections yet</p>
              <p className="mt-1">Start building your professional network with peers in your industry.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkPage;
