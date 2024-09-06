type ContentType = 'text' | 'user_phone_number' | 'user_email';

export class QuickReply {
    content_type: ContentType = 'text';
    title?: string;
    payload?: string | number;
    image_url?: string;

    /**
     * Creates a new QuickReply.
     * @param title - The title of the quick reply.
     */
    constructor(title: string) {
        this.title = title;
    }

    /**
     * Sets the payload for the QuickReply.
     * @param payload - The payload to set.
     * @returns The current instance of QuickReply.
     */
    setPayload(payload: string | number): QuickReply {
        this.payload = payload;
        return this;
    }

    /**
     * Sets the image URL for the QuickReply.
     * @param imageUrl - The image URL to set.
     * @returns The current instance of QuickReply.
     */
    setImageUrl(imageUrl: string): QuickReply {
        this.image_url = imageUrl;
        return this;
    }

    /**
     * Converts the QuickReply into a JSON object.
     * @returns The QuickReply as a JSON object.
     */
    toJSON(): object {
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

    /**
     * Creates a new QuickReplies instance.
     * @param text - The text to display with the quick replies.
     */
    constructor(text: string) {
        this.text = text;
    }

    /**
     * Sets the attachment for the QuickReplies.
     * @param attachment - The attachment object to set.
     * @returns The current instance of QuickReplies.
     */
    setAttachment(attachment: object): QuickReplies {
        this.attachment = attachment;
        return this;
    }

    /**
     * Adds quick replies to the QuickReplies instance.
     * @param replies - An array of QuickReply objects to add.
     * @returns The current instance of QuickReplies.
     */
    addQuickReply(replies: QuickReply[]): QuickReplies {
        this.quick_replies.push(...replies);
        return this;
    }

    /**
     * Converts the QuickReplies into a JSON object.
     * @returns The QuickReplies as a JSON object.
     */
    toJSON(): object {
        return {
            text: this.text,
            attachment: this.attachment,
            quick_replies: this.quick_replies,
        };
    }
}
