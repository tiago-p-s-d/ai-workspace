import { 
  Component, 
  OnInit, 
  OnDestroy, 
  inject, 
  signal, 
  ViewChild, 
  ElementRef, 
  AfterViewChecked 
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatWindowService, Message } from '../../../services/chat/window/chat-window';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css'
})
export class ChatWindow implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') private messageInput!: ElementRef<HTMLTextAreaElement>;

  private route = inject(ActivatedRoute);
  private chatWindowService = inject(ChatWindowService);
  private routeSubscription!: Subscription;

  // State Signals
  activeChatId = signal<string | null>(null);
  messages = signal<Message[]>([]);
  isLoadingMessages = signal<boolean>(false);
  isSending = signal<boolean>(false);
  
  // Input Binding
  userPrompt = '';

  private shouldScrollToBottom = false;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.activeChatId.set(id);

      if (id) {
        this.loadMessages(id);
      } else {
        this.messages.set([]);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  /**
   * Adjusts textarea height dynamically based on content.
   */
  adjustTextareaHeight(): void {
    if (this.messageInput) {
      const el = this.messageInput.nativeElement;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }

  /**
   * Handles keyboard events (Enter to send, Shift+Enter to break line).
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  /**
   * Fetches message history for the active chat ID.
   */
  loadMessages(chatId: string): void {
    this.isLoadingMessages.set(true);
    this.chatWindowService.getChatMessages(chatId).subscribe({
      next: (data) => {
        this.messages.set(data);
        this.isLoadingMessages.set(false);
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.isLoadingMessages.set(false);
      }
    });
  }

  /**
   * Dispatches user prompt, applies optimistic UI update, and fetches assistant response.
   */
  handleSendMessage(): void {
    const content = this.userPrompt.trim();
    const chatId = this.activeChatId();

    if (!content || !chatId || this.isSending()) {
      return;
    }

    const userMessage: Message = {
      chatId,
      sender: 'user',
      content
    };

    this.messages.update((list) => [...list, userMessage]);
    this.userPrompt = '';
    this.isSending.set(true);
    this.shouldScrollToBottom = true;

    // Reset textarea height after sending
    if (this.messageInput) {
      this.messageInput.nativeElement.style.height = 'auto';
    }

    this.chatWindowService.sendMessage({ chatId, content }).subscribe({
      next: (assistantMessage) => {
        this.messages.update((list) => [...list, assistantMessage]);
        this.isSending.set(false);
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.isSending.set(false);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = 
          this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Auto-scroll failed:', err);
    }
  }
}