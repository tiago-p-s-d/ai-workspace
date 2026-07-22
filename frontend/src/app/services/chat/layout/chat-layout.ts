import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../app.config';

export interface Chat {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatResponse {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatLayoutService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = inject(API_URL);

  /**
   * Reactive signal holding the current list of chats for the sidebar.
   */
  readonly chats = signal<Chat[]>([]);

  /**
   * Reactive signal indicating whether the chat list is currently loading.
   */
  readonly isLoading = signal<boolean>(false);

  /**
   * Fetches the user's chat history from the backend and updates the `chats` signal.
   * 
   * @returns Observable emitting the array of user chats.
   */
  loadUserChats(): Observable<Chat[]> {
    this.isLoading.set(true);
    return this.http.get<Chat[]>(`${this.apiUrl}/chats`).pipe(
      tap((data) => {
        this.chats.set(data);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Failed to load chat history:', error);
        return throwError(() => new Error('Could not retrieve chat history. Please try again.'));
      })
    );
  }

  /**
   * Creates a new chat session, prepends it to the local state, and navigates to its route.
   * 
   * @returns Observable emitting the newly created chat details.
   */
  createNewChat(): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chats`, {}).pipe(
      tap((newChat) => {
        // Prepend the new chat to the reactive list
        this.chats.update((list) => [newChat, ...list]);
        // Navigate to the newly created chat route
        this.router.navigate(['/chat', newChat.id]);
      }),
      catchError((error) => {
        console.error('Failed to create new chat:', error);
        return throwError(() => new Error('Could not create a new chat session.'));
      })
    );
  }

  /**
   * Deletes a chat session on the backend and updates the reactive local state.
   * 
   * @param chatId Unique identifier of the chat to delete.
   * @returns Observable emitting the backend response.
   */
  deleteChat(chatId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chats/${chatId}`).pipe(
      tap(() => {
        this.removeChatFromState(chatId);
      }),
      catchError((error) => {
        console.error('Failed to delete chat:', error);
        return throwError(() => new Error('Could not delete the chat session.'));
      })
    );
  }

  /**
   * Removes a chat from the local state list (e.g., after a delete operation).
   * 
   * @param chatId Unique identifier of the chat to remove.
   */
  removeChatFromState(chatId: string): void {
    this.chats.update((list) => list.filter((chat) => chat.id !== chatId));
  }
}