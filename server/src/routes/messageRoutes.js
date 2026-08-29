const express = require('express');
const {
  getConversations,
  getMessagesWithUser,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/user/:recipientId', getMessagesWithUser);
router.post('/', sendMessage);

module.exports = router;
