const { Router } = require('express');
const chatController = require('../controllers/ChatController.js');
const authMiddleware = require('../middlewares/auth.middleware.js'); 

const chatRoutes = Router();

// Apply auth middleware to all chat endpoints
chatRoutes.use(authMiddleware);

// Chat list & creation routes
chatRoutes.get('/', (req, res) => chatController.listChats(req, res));
chatRoutes.post('/', (req, res) => chatController.createChat(req, res));
chatRoutes.delete('/:chatId', (req, res) => chatController.deleteChat(req, res));
chatRoutes.patch('/:chatId', (req, res) => chatController.updateTitle(req, res));

// Messages routes
chatRoutes.get('/:chatId/messages', (req, res) => chatController.getMessages(req, res));
chatRoutes.post('/:chatId/messages', (req, res) => chatController.sendMessage(req, res));

module.exports = chatRoutes;