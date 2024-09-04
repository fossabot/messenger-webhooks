export interface WebhookEvent {
    sender: Sender;
    recipient: Recipient;
    timestamp: number;
}

interface Sender {
    id: string;
}

interface Recipient {
    id: string;
}
