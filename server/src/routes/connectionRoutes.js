const express = require('express');
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  removeConnection,
  getMyConnections,
  getPendingRequests,
  getSuggestions,
  getConnectionStatus,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyConnections);
router.get('/pending', getPendingRequests);
router.get('/suggestions', getSuggestions);
router.get('/status/:userId', getConnectionStatus);
router.post('/request/:recipientId', sendRequest);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id/cancel', cancelRequest);
router.delete('/:userId/remove', removeConnection);

module.exports = router;
