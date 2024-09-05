export type ButtonType = 'web_url' | 'postback' | 'phone_number';

export interface ButtonOptions {
    type: ButtonType;
    title: string;
}

export class Button {
    type: ButtonType;
    title: string;

    constructor(options: ButtonOptions) {
        if (options.title.length > 20) {
            throw new Error('Button title must be 20 characters or less.');
        }

        this.type = options.type;
        this.title = options.title;
    }
}

export class URLButton extends Button {
    url: string;
    webview_height_ratio?: 'compact' | 'tall' | 'full';
    messenger_extensions?: boolean;
    fallback_url?: string;
    webview_share_button?: 'hide' | 'show';

    constructor(title: string, url: string) {
        super({
            type: 'web_url',
            title,
        });
        this.url = url;
    }

    setWebviewHeightRatio(webview_height_ratio: 'compact' | 'tall' | 'full'): URLButton {
        this.webview_height_ratio = webview_height_ratio;
        return this;
    }

    setMessengerExtensions(messenger_extensions: boolean): URLButton {
        this.messenger_extensions = messenger_extensions;
        return this;
    }

    setFallbackUrl(fallback_url: string): URLButton {
        this.fallback_url = fallback_url;
        return this;
    }

    setWebviewShareButton(webview_share_button: 'hide' | 'show'): URLButton {
        this.webview_share_button = webview_share_button;
        return this;
    }
}

export class PostbackButton extends Button {
    payload: string;

    constructor(title: string, payload: string) {
        super({
            type: 'postback',
            title,
        });
        this.payload = payload;
    }
}

export class CallButton extends Button {
    phone_number: string;

    constructor(title: string, phone_number: string) {
        super({
            type: 'phone_number',
            title,
        });
        this.phone_number = phone_number;
    }
}
