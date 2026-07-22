import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ChatLayoutService } from '../../../services/chat/layout/chat-layout';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css'
})
export class ChatLayout implements OnInit {
  protected layoutService = inject(ChatLayoutService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Expose reactive signals and user state to the template
  chats = this.layoutService.chats;
  isLoading = this.layoutService.isLoading;
  userEmail: string | null = null;

  ngOnInit(): void {
    this.userEmail = this.userService.getUserEmail();
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
   * Handles user logout by purging token/cache and redirecting to the login route.
   */
  handleLogout(): void {
    this.userService.logout();
    this.layoutService.clearState();
    this.router.navigate(['/login']);
  }

  /**
   * Handles chat deletion and redirects if the deleted chat is currently active.
   */
  onDeleteChat(event: MouseEvent, chatId: string): void {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Are you sure you want to delete this conversation?')) {
      this.layoutService.deleteChat(chatId).subscribe({
        next: () => {
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