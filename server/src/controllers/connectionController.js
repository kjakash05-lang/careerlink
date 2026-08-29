const Connection = require('../models/Connection');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

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

      // Create notification
      const senderProfile = await Profile.findOne({ user: req.user.id });
      await Notification.create({
        recipient: recipientId,
        sender: req.user.id,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${senderProfile ? senderProfile.fullName : 'Someone'} sent you a connection request.`,
        data: { connectionId: existing._id },
      });

      return res.status(200).json({ success: true, message: 'Connection request sent.', connection: existing });
    }

    const connection = await Connection.create({
      requester: req.user.id,
      recipient: recipientId,
      status: 'pending',
    });

    const senderProfile = await Profile.findOne({ user: req.user.id });
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${senderProfile ? senderProfile.fullName : 'Someone'} sent you a connection request.`,
      data: { connectionId: connection._id },
    });

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

    // Send notification to requester
    const accepterProfile = await Profile.findOne({ user: req.user.id });
    await Notification.create({
      recipient: connection.requester,
      sender: req.user.id,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${accepterProfile ? accepterProfile.fullName : 'Someone'} accepted your connection request.`,
      data: { connectionId: connection._id },
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

    await connection.deleteOne();
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
        populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
      })
      .populate({
        path: 'recipient',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
      });

    // Map to connected user objects
    const connectedUsers = connections.map((conn) => {
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

    // Find up to 12 potential connections
    const users = await User.find({ _id: { $nin: excludedUserIds }, isActive: true })
      .limit(12)
      .populate('profile', 'firstName lastName headline avatar location skills')
      .select('email role');

    res.status(200).json({ success: true, count: users.length, suggestions: users });
  } catch (err) {
    next(err);
  }
};
