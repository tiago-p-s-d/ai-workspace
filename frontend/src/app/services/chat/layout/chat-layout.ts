import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  private readonly CACHE_KEY = 'chats_cache';

  /**
   * Reactive signal holding the current list of chats for the sidebar.
   */
  readonly chats = signal<Chat[]>([]);

  /**
   * Reactive signal indicating whether the chat list is currently loading.
   */
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.loadFromCache();
  }

  /**
   * Loads initial chats from browser LocalStorage to prevent flicker on page refresh.
   */
  private loadFromCache(): void {
    if (isPlatformBrowser(this.platformId)) {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (cachedData) {
        try {
          this.chats.set(JSON.parse(cachedData));
        } catch (error) {
          console.error('Failed to parse cached chats:', error);
        }
      }
    }
  }

  /**
   * Saves current state to LocalStorage for SSR/Browser hydrations.
   */
  private saveToCache(data: Chat[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    }
  }

  /**
   * Resets local signals state upon user logout.
   */
  clearState(): void {
    this.chats.set([]);
    this.isLoading.set(false);
  }

  /**
   * Fetches the user's chat history from the backend and updates the `chats` signal.
   * Performs silent updates in background if cached data is already present.
   * 
   * @returns Observable emitting the array of user chats.
   */
  loadUserChats(): Observable<Chat[]> {
    if (this.chats().length === 0) {
      this.isLoading.set(true);
    }

    return this.http.get<Chat[]>(`${this.apiUrl}/chats`).pipe(
      tap((data) => {
        this.chats.set(data);
        this.saveToCache(data);
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
        this.chats.update((list: Chat[]) => {
          const updated = [newChat, ...list];
          this.saveToCache(updated);
          return updated;
        });
        this.router.navigate(['/chat', newChat.id]);
      }),
      catchError((error) => {
        console.error('Failed to create new chat:', error);
        return throwError(() => new Error('Could not create a new chat session.'));
      })
    );
  }

  /**
   * Updates a chat's title in the local state in real-time.
   * 
   * @param chatId Unique identifier of the target chat.
   * @param newTitle New title string to apply.
   */
  updateChatTitleInState(chatId: string, newTitle: string): void {
    this.chats.update((list: Chat[]) => {
      const updated = list.map((chat: Chat) => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      this.saveToCache(updated);
      return updated;
    });
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
    this.chats.update((list: Chat[]) => {
      const updated = list.filter((chat: Chat) => chat.id !== chatId);
      this.saveToCache(updated);
      return updated;
    });
  }
}