import type { CallButton, PostbackButton, UrlButton } from '@/types';

export interface Template {
    template_type: string;
    text: string;
    buttons: CallButton[] | PostbackButton[] | UrlButton[];
}
