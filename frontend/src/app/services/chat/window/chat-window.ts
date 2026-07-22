import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '../../../app.config';

export type MessageSender = 'user' | 'assistant';

export interface Message {
  id?: number;
  chatId: string;
  sender: MessageSender;
  content: string;
  createdAt?: string;
}

export interface SendMessagePayload {
  chatId: string;
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatWindowService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  /**
   * Retrieves all messages belonging to a specific chat session.
   * 
   * @param chatId Unique identifier of the chat.
   * @returns Observable emitting an array of messages.
   */
  getChatMessages(chatId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/chats/${chatId}/messages`).pipe(
      catchError((error) => {
        console.error(`Failed to load messages for chat ${chatId}:`, error);
        return throwError(() => new Error('Could not retrieve chat messages.'));
      })
    );
  }

  /**
   * Sends a user message to the backend and retrieves the assistant's response.
   * 
   * @param payload Object containing target chatId and message content.
   * @returns Observable emitting the generated assistant message response.
   */
  sendMessage(payload: SendMessagePayload): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/chats/${payload.chatId}/messages`, {
      content: payload.content
    }).pipe(
      catchError((error) => {
        console.error('Failed to send message:', error);
        return throwError(() => new Error('Could not process your message. Please try again.'));
      })
    );
  }

  /**
   * Updates the title of a specific chat session.
   * 
   * @param chatId Unique identifier of the chat to update.
   * @param title The new title to assign to the chat session.
   * @returns Observable emitting the updated Chat object or status.
   */
  updateChatTitle(chatId: string, title: string): Observable<Chat> {
    return this.http.patch<Chat>(`${this.apiUrl}/chats/${chatId}`, { title }).pipe(
      catchError((error) => {
        console.error(`Failed to update title for chat ${chatId}:`, error);
        return throwError(() => new Error('Could not update chat title. Please try again.'));
      })
    );
  }
}