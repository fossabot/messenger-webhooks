import type { Postback, WebhookEvent } from '@/types';

export interface PostbackEvent extends WebhookEvent {
    postback: Postback;
}
