import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ChatLayoutService } from '../../../services/chat/layout/chat-layout';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css'
})
export class ChatLayout implements OnInit {
  protected layoutService = inject(ChatLayoutService);
  private router = inject(Router);

  // Expose reactive signals to the template
  chats = this.layoutService.chats;
  isLoading = this.layoutService.isLoading;

  ngOnInit(): void {
    this.fetchHistory();
  }

  /**
   * Triggers history loading via the layout service.
   */
  fetchHistory(): void {
    this.layoutService.loadUserChats().subscribe();
  }

  /**
   * Triggers new chat creation and automatic route redirection.
   */
  handleNewChat(): void {
    this.layoutService.createNewChat().subscribe();
  }

  /**
   * Handles chat deletion and redirects if the deleted chat is currently active.
   */
  onDeleteChat(event: MouseEvent, chatId: string): void {
    // Prevents triggering the routerLink navigation on the parent anchor tag
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Are you sure you want to delete this conversation?')) {
      this.layoutService.deleteChat(chatId).subscribe({
        next: () => {
          // Redirect to the base chat route if the currently open chat was deleted
          if (this.router.url.includes(chatId)) {
            this.router.navigate(['/chat']);
          }
        },
        error: (err) => {
          console.error('Failed to delete chat:', err);
        }
      });
    }
  }
}