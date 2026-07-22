const db = require('../db');

/**
 * Service responsible for chat and message database operations and business logic.
 */
class ChatService {
  /**
   * Helper function to call local Ollama instance running on host.
   * 
   * @param {Array<{role: string, content: string}>} messagesHistory 
   * @returns {Promise<string>} Model response text.
   */
  async getOllamaResponse(messagesHistory) {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';
    const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:latest';

    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: messagesHistory,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || 'Unable to retrieve a response from the model.';
    } catch (error) {
      console.error('Error connecting to Ollama:', error.message);
      return 'Sorry, an error occurred while communicating with the local model.';
    }
  }

  /**
   * Fetches all chats owned by a specific user.
   */
  async getUserChats(userId) {
    return db('chats')
      .select(
        'id',
        'user_id as userId',
        'title',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  /**
   * Creates a new chat session for a user.
   */
  async createChat(userId, title = 'New Chat') {
    const [insertResult] = await db('chats').insert({
      user_id: userId,
      title
    });

    const chat = await db('chats')
      .select(
        'id',
        'user_id as userId',
        'title',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where(typeof insertResult === 'number' ? { id: insertResult } : { user_id: userId, title })
      .orderBy('created_at', 'desc')
      .first();

    return chat;
  }

  /**
   * Retrieves message history for a chat if it belongs to the specified user.
   */
  async getChatMessages(chatId, userId) {
    const chat = await db('chats')
      .where({ id: chatId, user_id: userId })
      .first();

    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    return db('messages')
      .select(
        'id',
        'chat_id as chatId',
        'sender',
        'content',
        'created_at as createdAt'
      )
      .where({ chat_id: chatId })
      .orderBy('created_at', 'asc');
  }

  /**
   * Sends a user message, passes context to Ollama, and saves the generated response.
   */
  async sendMessage(chatId, userId, content) {
    const chat = await db('chats')
      .where({ id: chatId, user_id: userId })
      .first();

    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    // 1. Save user message
    await db('messages').insert({
      chat_id: chatId,
      sender: 'user',
      content
    });

    // 2. Fetch context history
    const history = await db('messages')
      .select('sender', 'content')
      .where({ chat_id: chatId })
      .orderBy('created_at', 'asc');

    const formattedMessages = history.map(msg => ({
      role: msg.sender === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // 3. Get response from local Ollama model
    const assistantContent = await this.getOllamaResponse(formattedMessages);

    // 4. Save assistant response
    const [messageId] = await db('messages').insert({
      chat_id: chatId,
      sender: 'assistant',
      content: assistantContent
    });

    // 5. Fetch and return saved response record
    const assistantMessage = await db('messages')
      .select(
        'id',
        'chat_id as chatId',
        'sender',
        'content',
        'created_at as createdAt'
      )
      .where(typeof messageId === 'number' ? { id: messageId } : { chat_id: chatId, sender: 'assistant' })
      .orderBy('created_at', 'desc')
      .first();

    return assistantMessage;
  }

  /**
   * Deletes a chat session and all associated messages for a specific user.
   * 
   * @param {string|number} chatId 
   * @param {number} userId 
   * @returns {Promise<boolean>} True if deleted successfully.
   */
  async deleteChat(chatId, userId) {
    return db.transaction(async (trx) => {
      // 1. Check if the chat exists and belongs to the requesting user
      const chat = await trx('chats')
        .where({ id: chatId, user_id: userId })
        .first();

      if (!chat) {
        throw new Error('CHAT_NOT_FOUND');
      }

      // 2. Delete all related messages first (foreign key protection)
      await trx('messages')
        .where({ chat_id: chatId })
        .del();

      // 3. Delete the chat session record
      await trx('chats')
        .where({ id: chatId, user_id: userId })
        .del();

      return true;
    });
  }
}

module.exports = new ChatService();