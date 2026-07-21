import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
}