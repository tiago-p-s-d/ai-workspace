const chatService = require('../services/ChatService');

/**
 * Controller handling HTTP requests related to chats and messages.
 */
class ChatController {
  /**
   * Retrieves list of chats for the logged-in user.
   */
  async listChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await chatService.getUserChats(userId);

      return res.status(200).json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      return res.status(500).json({ message: 'Internal server error while fetching chats.' });
    }
  }

  /**
   * Creates a new chat for the logged-in user.
   */
  async createChat(req, res) {
    try {
      const userId = req.user.id;
      const { title } = req.body;

      const newChat = await chatService.createChat(userId, title);

      return res.status(201).json(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      return res.status(500).json({ message: 'Internal server error while creating chat.' });
    }
  }

  /**
   * Retrieves messages for a given chat ID.
   */
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;

      const messages = await chatService.getChatMessages(chatId, userId);

      return res.status(200).json(messages);
    } catch (error) {
      if (error.message === 'CHAT_NOT_FOUND') {
        return res.status(404).json({ message: 'Chat not found or access denied.' });
      }

      console.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Internal server error while fetching messages.' });
    }
  }

  /**
   * Posts a new message to a chat and receives an assistant response.
   */
  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
      }

      const response = await chatService.sendMessage(chatId, userId, content);

      return res.status(201).json(response);
    } catch (error) {
      if (error.message === 'CHAT_NOT_FOUND') {
        return res.status(404).json({ message: 'Chat not found or access denied.' });
      }

      console.error('Error sending message:', error);
      return res.status(500).json({ message: 'Internal server error while sending message.' });
    }
  }

  /**
   * Deletes a chat and its associated messages for the logged-in user.
   */
  async deleteChat(req, res) {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;

      await chatService.deleteChat(chatId, userId);

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'CHAT_NOT_FOUND') {
        return res.status(404).json({ message: 'Chat not found or access denied.' });
      }

      console.error('Error deleting chat:', error);
      return res.status(500).json({ message: 'Internal server error while deleting chat.' });
    }
  }
  /**
    * Updates the title of an existing chat for the logged-in user.
    */
  async updateTitle(req, res) {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;
      const { title } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
      }

      const updatedChat = await chatService.updateChatTitle(chatId, userId, title.trim());

      return res.status(200).json(updatedChat);
    } catch (error) {
      if (error.message === 'CHAT_NOT_FOUND') {
        return res.status(404).json({ message: 'Chat not found or access denied.' });
      }

      console.error('Error updating chat title:', error);
      return res.status(500).json({ message: 'Internal server error while updating chat title.' });
    }
  }
}

module.exports = new ChatController();