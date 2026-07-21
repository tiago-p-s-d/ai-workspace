import { TestBed } from '@angular/core/testing';

import { ChatLayout } from './chat-layout';

describe('ChatLayout', () => {
  let service: ChatLayout;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatLayout);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
