import type { Template, WebhookEvent } from '@/types';

export interface TemplateEvent extends WebhookEvent {
    template: Template;
}
