import type { Button } from './Button';

type MediaType = 'image' | 'video';

export class MediaElement {
    media_type: MediaType;
    attachment_id?: string;
    url?: string;
    buttons?: Button[];

    constructor(media_type: MediaType) {
        this.media_type = media_type;
    }

    setAttachmentId(attachment_id: string): MediaElement {
        if (this.url) {
            throw new Error('Cannot set both attachment_id and url');
        }

        this.attachment_id = attachment_id;
        return this;
    }

    setUrl(url: string): MediaElement {
        if (this.attachment_id) {
            throw new Error('Cannot set both attachment_id and url');
        }

        this.url = url;
        return this;
    }

    addButtons(buttons: Button[]): MediaElement {
        if (this.buttons && this.buttons.length + buttons.length > 3) {
            throw new Error('Button template can have a maximum of 3 buttons.');
        }
        this.buttons = this.buttons ? [...this.buttons, ...buttons] : buttons;
        return this;
    }

    toJSON() {
        return {
            media_type: this.media_type,
            ...(this.attachment_id && { attachment_id: this.attachment_id }),
            ...(this.url && { url: this.url }),
            buttons: this.buttons,
        };
    }
}

export class MediaTemplate {
    private elements: MediaElement;
    private sharable: boolean;

    constructor({ sharable = false }: { sharable?: boolean } = {}) {
        this.elements = new MediaElement('image');
        this.sharable = sharable;
    }

    addElement(element: MediaElement): MediaTemplate {
        this.elements = element;
        return this;
    }

    toJSON() {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'media',
                    elements: this.elements,
                    sharable: this.sharable,
                },
            },
        };
    }
}
