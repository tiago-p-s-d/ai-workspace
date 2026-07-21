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
    // Se estiver no Docker, usa host.docker.internal; se rodar direto no host, usa localhost
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';
    const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:latest'; // ou o modelo que você baixou

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
      return data.message?.content || 'Não foi possível obter uma resposta do modelo.';
    } catch (error) {
      console.error('Error connecting to Ollama:', error.message);
      return 'Desculpe, ocorreu um erro ao se comunicar com o modelo local.';
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

    // 1. Salva a mensagem enviada pelo usuário
    await db('messages').insert({
      chat_id: chatId,
      sender: 'user',
      content
    });

    // 2. Busca histórico anterior da conversa para dar contexto ao Ollama
    const history = await db('messages')
      .select('sender', 'content')
      .where({ chat_id: chatId })
      .orderBy('created_at', 'asc');

    // Mapeia os papeis para o formato esperado pelo Ollama (user/assistant)
    const formattedMessages = history.map(msg => ({
      role: msg.sender === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // 3. Obtém resposta da IA local
    const assistantContent = await this.getOllamaResponse(formattedMessages);

    // 4. Salva a resposta gerada pelo assistente
    const [messageId] = await db('messages').insert({
      chat_id: chatId,
      sender: 'assistant',
      content: assistantContent
    });

    // 5. Busca e retorna o registro gravado
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
}

module.exports = new ChatService(); 