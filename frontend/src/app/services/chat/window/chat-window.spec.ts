import { TestBed } from '@angular/core/testing';

import { ChatWindow } from './chat-window';

describe('ChatWindow', () => {
  let service: ChatWindow;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatWindow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
