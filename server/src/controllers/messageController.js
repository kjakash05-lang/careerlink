const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Resolve User ID if passed Profile ID
const resolveUserId = async (id) => {
  if (!id) return null;
  const strId = id.toString();
  if (mongoose.Types.ObjectId.isValid(strId)) {
    const isUser = await User.exists({ _id: strId });
    if (isUser) return strId;
    const prof = await Profile.findById(strId);
    if (prof && prof.user) return prof.user.toString();
  }
  return strId;
};

// Verify that two users are connected
const areUsersConnected = async (user1Id, user2Id) => {
  const u1 = await resolveUserId(user1Id);
  const u2 = await resolveUserId(user2Id);
  const connection = await Connection.findOne({
    $or: [
      { requester: u1, recipient: u2 },
      { requester: u2, recipient: u1 },
    ],
    status: 'accepted',
  });
  return Boolean(connection);
};

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: 'participants',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      })
      .populate('lastMessage');

    // Add unread count and other participant details
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id.toString() !== req.user.id.toString()
        );

        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: req.user.id,
          read: false,
        });

        return {
          _id: conv._id,
          otherUser: otherParticipant,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    res.status(200).json({ success: true, count: formatted.length, conversations: formatted });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages in conversation with recipient user ID
// @route   GET /api/messages/user/:recipientId
// @access  Private
exports.getMessagesWithUser = async (req, res, next) => {
  try {
    const targetRecipientId = await resolveUserId(req.params.recipientId);

    // Verify connection status
    const isConnected = await areUsersConnected(req.user.id, targetRecipientId);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are connected with.',
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, targetRecipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, targetRecipientId],
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .populate({
        path: 'sender',
        select: 'email',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      });

    // Mark unread messages as read
    await Message.updateMany(
      { conversation: conversation._id, recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const rawRecipient = req.body.recipientId || req.body.recipient;
    const { content } = req.body;

    if (!rawRecipient || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required.' });
    }

    const targetRecipientId = await resolveUserId(rawRecipient);

    // Verify connection
    const isConnected = await areUsersConnected(req.user.id, targetRecipientId);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: 'You can only send messages to your accepted connections.',
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, targetRecipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, targetRecipientId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      recipient: targetRecipientId,
      content: content.trim(),
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate({
      path: 'sender',
      select: 'email',
      populate: { path: 'profile', select: 'firstName lastName headline avatar' },
    });

    // Emit via Socket.io to user private rooms
    const io = req.app.get('io');
    if (io) {
      const recId = targetRecipientId.toString();
      const sendId = req.user.id.toString();
      io.to(`user:${recId}`).emit('receive_message', populatedMessage);
      io.to(`user:${recId}`).emit('message:new', populatedMessage);
      io.to(recId).emit('receive_message', populatedMessage);
      io.to(recId).emit('message:new', populatedMessage);

      io.to(`user:${sendId}`).emit('message_sent', populatedMessage);
      io.to(`user:${sendId}`).emit('message:sent', populatedMessage);
      io.to(sendId).emit('message_sent', populatedMessage);
      io.to(sendId).emit('message:sent', populatedMessage);
    }

    // Create notification
    const senderProfile = await Profile.findOne({ user: req.user.id });
    await Notification.create({
      recipient: targetRecipientId,
      sender: req.user.id,
      type: 'new_message',
      title: 'New Message',
      message: `${senderProfile ? senderProfile.fullName : 'Someone'} sent you a message.`,
      data: { conversationId: conversation._id, messageId: message._id },
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    next(err);
  }
};
