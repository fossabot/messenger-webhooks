import type { Event } from '@/types';

export interface WebhookBody {
    object: string;
    entry: Event[];
}
