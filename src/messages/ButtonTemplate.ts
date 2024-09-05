import type { Button } from './Button';

export class ButtonTemplate {
    text: string;
    buttons: Button[] = [];

    constructor(text: string) {
        if (text.length > 640) {
            throw new Error('Button template text must be 640 characters or less.');
        }
        this.text = text;
    }

    addButtons(buttons: Button[]): ButtonTemplate {
        if (this.buttons && this.buttons.length + buttons.length > 3) {
            throw new Error('Button template can have a maximum of 3 buttons.');
        }
        this.buttons = this.buttons ? [...this.buttons, ...buttons] : buttons;
        return this;
    }

    toJSON() {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text: this.text,
                    buttons: this.buttons.map((button) => button),
                },
            },
        };
    }
}
