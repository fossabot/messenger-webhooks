import type {
    MessageEvent,
    PostbackEvent,
    TemplateEvent,
    EventType,
    QuickReplyEvent,
} from '@/types';

/**
 * Determines the event type based on the structure of the event object.
 * @param event - The event object to evaluate.
 * @returns The event type or null if none match.
 */
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
