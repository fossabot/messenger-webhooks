interface Button {
    type: string;
    title: string;
    url?: string;
    payload?: string;
}

export class GenericElement {
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
        type: string;
        url: string;
        webview_height_ratio: string;
    };
    buttons?: Button[];

    constructor({ title }: { title: string }) {
        if (title.length > 80) {
            throw new Error('Title must be 80 characters or less.');
        }

        this.title = title;
    }

    setSubtitle(subtitle: string): GenericElement {
        if (subtitle.length > 80) {
            throw new Error('Subtitle must be 80 characters or less.');
        }
        this.subtitle = subtitle;
        return this;
    }

    setImageUrl(image_url: string): GenericElement {
        this.image_url = image_url;
        return this;
    }

    setDefaultAction(default_action: {
        type: string;
        url: string;
        webview_height_ratio: string;
    }): GenericElement {
        this.default_action = default_action;
        return this;
    }

    addButtons(buttons: Button[]): GenericElement {
        if (this.buttons && this.buttons.length + buttons.length > 3) {
            throw new Error('Button template can have a maximum of 3 buttons.');
        }
        this.buttons = this.buttons ? [...this.buttons, ...buttons] : buttons;
        return this;
    }

    toJSON() {
        return {
            title: this.title,
            subtitle: this.subtitle,
            image_url: this.image_url,
            default_action: this.default_action,
            buttons: this.buttons,
        };
    }
}

export class GenericTemplate {
    private elements: GenericElement[];
    private sharable: boolean;

    constructor({ sharable = false }: { sharable?: boolean } = {}) {
        this.elements = [];
        this.sharable = sharable;
    }

    addElement(element: GenericElement): GenericTemplate {
        if (this.elements.length >= 10) {
            throw new Error('Generic template supports a maximum of 10 elements');
        }
        this.elements.push(element);
        return this;
    }

    toJSON() {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: this.elements,
                    sharable: this.sharable,
                },
            },
        };
    }
}
