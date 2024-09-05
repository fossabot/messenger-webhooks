type ContentType = 'text' | 'user_phone_number' | 'user_email';

export class QuickReply {
    content_type: ContentType = 'text';
    title?: string;
    payload?: string | number;
    image_url?: string;

    constructor(title: string) {
        this.title = title;
    }

    setPayload(payload: string | number): QuickReply {
        this.payload = payload;
        return this;
    }

    setImageUrl(imageUrl: string): QuickReply {
        this.image_url = imageUrl;
        return this;
    }

    toJSON() {
        return {
            content_type: this.content_type,
            title: this.title,
            payload: this.payload,
            image_url: this.image_url,
        };
    }
}

export class QuickReplies {
    text: string;
    attachment?: object;
    quick_replies: QuickReply[] = [];

    constructor(text: string) {
        this.text = text;
    }

    setAttachment(attachment: object): QuickReplies {
        this.attachment = attachment;
        return this;
    }

    addQuickReply(replies: QuickReply[]): QuickReplies {
        this.quick_replies.push(...replies);
        return this;
    }

    toJSON() {
        return {
            text: this.text,
            attachment: this.attachment,
            quick_replies: this.quick_replies,
        };
    }
}
