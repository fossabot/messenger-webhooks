import type { CallButton, PostbackButton, URLButton } from '@/messages';
import type { WebhookEvent } from '@/types';

export interface TemplateEvent extends WebhookEvent {
    template: {
        template_type: string;
        text: string;
        buttons: CallButton[] | PostbackButton[] | URLButton[];
    };
}
