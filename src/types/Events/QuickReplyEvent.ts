import type { WebhookEvent } from '@/types';

export interface QuickReplyEvent extends WebhookEvent {
    quick_reply: {
        payload: string;
    };
}
