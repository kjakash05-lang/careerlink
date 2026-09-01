const Connection = require('../models/Connection');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// Helper to emit connection updates to all user rooms
const emitConnectionUpdate = (io, recipientId, requesterId, payload) => {
  if (!io) return;
  if (recipientId) {
    const rId = recipientId.toString();
    io.to(`user:${rId}`).emit('connection_updated', payload);
    io.to(`user:${rId}`).emit('connection:updated', payload);
    io.to(rId).emit('connection_updated', payload);
    io.to(rId).emit('connection:updated', payload);
  }
  if (requesterId) {
    const reqId = requesterId.toString();
    io.to(`user:${reqId}`).emit('connection_updated', payload);
    io.to(`user:${reqId}`).emit('connection:updated', payload);
    io.to(reqId).emit('connection_updated', payload);
    io.to(reqId).emit('connection:updated', payload);
  }
};

// Helper to create and emit real-time notification
const sendNotification = async (req, notifData) => {
  try {
    const notif = await Notification.create(notifData);
    const populated = await Notification.findById(notif._id).populate({
      path: 'sender',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
    });
    const io = req.app.get('io');
    if (io && notifData.recipient) {
      const recId = notifData.recipient.toString();
      console.log(`[Notification] Emitted to user:${recId} & ${recId}: ${populated.title} - ${populated.message}`);
      io.to(`user:${recId}`).emit('notification:new', populated);
      io.to(`user:${recId}`).emit('new_notification', populated);
      io.to(recId).emit('notification:new', populated);
      io.to(recId).emit('new_notification', populated);
    }
    return populated;
  } catch (err) {
    console.warn('Notification error:', err.message);
  }
};

// @desc    Get relationship status with a specific user
// @route   GET /api/connections/status/:userId
// @access  Private
exports.getConnectionStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id.toString()) {
      return res.status(200).json({ success: true, status: 'SELF' });
    }

    const connection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
    });

    if (!connection) {
      return res.status(200).json({ success: true, status: 'NONE' });
    }

    if (connection.status === 'accepted') {
      return res.status(200).json({ success: true, status: 'CONNECTED', connectionId: connection._id });
    }

    if (connection.status === 'pending') {
      if (connection.requester.toString() === req.user.id.toString()) {
        return res.status(200).json({ success: true, status: 'PENDING_SENT', connectionId: connection._id });
      } else {
        return res.status(200).json({ success: true, status: 'PENDING_RECEIVED', connectionId: connection._id });
      }
    }

    return res.status(200).json({ success: true, status: 'NONE' });
  } catch (err) {
    next(err);
  }
};

// @desc    Send connection request
// @route   POST /api/connections/request/:recipientId
// @access  Private
exports.sendRequest = async (req, res, next) => {
  try {
    const { recipientId } = req.params;

    if (recipientId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if an existing connection exists in either direction
    const existing = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id },
      ],
    });

    const senderProfile = await Profile.findOne({ user: req.user.id });
    const senderName = senderProfile ? senderProfile.fullName : 'Someone';

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected with this user.' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'A connection request is already pending.' });
      }
      // If rejected earlier, allow re-request
      existing.requester = req.user.id;
      existing.recipient = recipientId;
      existing.status = 'pending';
      await existing.save();

      // Create & emit real-time notification
      await sendNotification(req, {
        recipient: recipientId,
        sender: req.user.id,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${senderName} sent you a connection request.`,
        data: { connectionId: existing._id },
      });

      const io = req.app.get('io');
      emitConnectionUpdate(io, recipientId, req.user.id, { type: 'REQUEST_RECEIVED', connection: existing });

      return res.status(200).json({ success: true, message: 'Connection request sent.', connection: existing });
    }

    const connection = await Connection.create({
      requester: req.user.id,
      recipient: recipientId,
      status: 'pending',
    });

    await sendNotification(req, {
      recipient: recipientId,
      sender: req.user.id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${senderName} sent you a connection request.`,
      data: { connectionId: connection._id },
    });

    const io = req.app.get('io');
    emitConnectionUpdate(io, recipientId, req.user.id, { type: 'REQUEST_RECEIVED', connection });

    res.status(201).json({ success: true, message: 'Connection request sent.', connection });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/:id/accept
// @access  Private
exports.acceptRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    // Only recipient can accept
    if (connection.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request.' });
    }

    connection.status = 'accepted';
    await connection.save();

    const accepterProfile = await Profile.findOne({ user: req.user.id });
    const accepterName = accepterProfile ? accepterProfile.fullName : 'Someone';

    // Mark incoming connection request notification as read
    await Notification.updateMany(
      { recipient: req.user.id, 'data.connectionId': connection._id },
      { isRead: true }
    );

    // Send notification to requester
    await sendNotification(req, {
      recipient: connection.requester,
      sender: req.user.id,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${accepterName} accepted your connection request.`,
      data: { connectionId: connection._id },
    });

    // Notify both users in real-time
    const io = req.app.get('io');
    emitConnectionUpdate(io, connection.recipient, connection.requester, {
      type: 'REQUEST_ACCEPTED',
      connection,
    });

    res.status(200).json({ success: true, message: 'Connection request accepted.', connection });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject connection request
// @route   PUT /api/connections/:id/reject
// @access  Private
exports.rejectRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    if (connection.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request.' });
    }

    connection.status = 'rejected';
    await connection.save();

    // Mark notification as read
    await Notification.updateMany(
      { recipient: req.user.id, 'data.connectionId': connection._id },
      { isRead: true }
    );

    const io = req.app.get('io');
    emitConnectionUpdate(io, connection.recipient, connection.requester, {
      type: 'REQUEST_REJECTED',
      connectionId: req.params.id,
    });

    res.status(200).json({ success: true, message: 'Connection request rejected.', connection });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel outgoing connection request
// @route   DELETE /api/connections/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    if (connection.requester.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }

    const recipientId = connection.recipient.toString();
    await connection.deleteOne();

    const io = req.app.get('io');
    emitConnectionUpdate(io, recipientId, req.user.id, {
      type: 'REQUEST_CANCELLED',
      connectionId: req.params.id,
    });

    res.status(200).json({ success: true, message: 'Connection request cancelled.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:userId/remove
// @access  Private
exports.removeConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
      status: 'accepted',
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found.' });
    }

    await connection.deleteOne();

    const io = req.app.get('io');
    emitConnectionUpdate(io, userId, req.user.id, {
      type: 'CONNECTION_REMOVED',
      userId: req.user.id,
    });

    res.status(200).json({ success: true, message: 'Connection removed.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's connections
// @route   GET /api/connections
// @access  Private
exports.getMyConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: 'accepted',
    })
      .populate({
        path: 'requester',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location skills' },
      })
      .populate({
        path: 'recipient',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location skills' },
      });

    // Map to connected user objects
    const connectedUsers = connections
      .filter((conn) => conn.requester && conn.recipient)
      .map((conn) => {
        const isRequester = conn.requester._id.toString() === req.user.id.toString();
        const otherUser = isRequester ? conn.recipient : conn.requester;
        return {
          connectionId: conn._id,
          connectedAt: conn.updatedAt,
          user: otherUser,
        };
      });

    res.status(200).json({ success: true, count: connectedUsers.length, connections: connectedUsers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending received and sent requests
// @route   GET /api/connections/pending
// @access  Private
exports.getPendingRequests = async (req, res, next) => {
  try {
    const received = await Connection.find({
      recipient: req.user.id,
      status: 'pending',
    }).populate({
      path: 'requester',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar location skills' },
    });

    const sent = await Connection.find({
      requester: req.user.id,
      status: 'pending',
    }).populate({
      path: 'recipient',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar location skills' },
    });

    res.status(200).json({
      success: true,
      received,
      sent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get suggested connections
// @route   GET /api/connections/suggestions
// @access  Private
exports.getSuggestions = async (req, res, next) => {
  try {
    // Find all users who are already connected or have pending requests
    const existingConnections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    });

    const excludedUserIds = [
      req.user.id,
      ...existingConnections.map((c) =>
        c.requester.toString() === req.user.id.toString() ? c.recipient.toString() : c.requester.toString()
      ),
    ];

    // Find up to 16 potential connections from real database users
    const users = await User.find({ _id: { $nin: excludedUserIds }, isActive: true })
      .limit(16)
      .populate('profile', 'firstName lastName headline avatar location skills')
      .select('email role');

    // Filter only users who have a valid profile
    const validSuggestions = users.filter((u) => u.profile);

    res.status(200).json({ success: true, count: validSuggestions.length, suggestions: validSuggestions });
  } catch (err) {
    next(err);
  }
};
