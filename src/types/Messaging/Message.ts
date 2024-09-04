import type { QuickReply } from './QuickReply';

export interface Message {
    mid: string;
    text: string;
    quick_reply?: QuickReply;
}
