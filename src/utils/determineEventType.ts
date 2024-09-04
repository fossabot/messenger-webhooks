import type {
    MessageEvent,
    PostbackEvent,
    TemplateEvent,
    EventType,
    QuickReplyEvent,
} from '@/types';

export function determineEventType(
    event: MessageEvent | PostbackEvent | TemplateEvent | QuickReplyEvent,
): EventType | null {
    if ('message' in event) {
        return event.message.quick_reply ? 'quick_reply' : 'message';
    } else if ('postback' in event) {
        return 'postback';
    } else if ('template' in event) {
        return 'template';
    }
    return null;
}
