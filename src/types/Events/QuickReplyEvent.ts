import type { QuickReply, WebhookEvent } from '@/types';

export interface QuickReplyEvent extends WebhookEvent {
    quick_reply: QuickReply;
}
