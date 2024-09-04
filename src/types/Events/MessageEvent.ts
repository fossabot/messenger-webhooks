import type { Message, WebhookEvent } from '@/types';

export interface MessageEvent extends WebhookEvent {
    message: Message;
}
