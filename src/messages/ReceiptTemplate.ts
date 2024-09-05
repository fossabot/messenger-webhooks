interface Address {
    street_1: string;
    street_2?: string;
    city: string;
    postal_code: string;
    state: string;
    country: string;
}

interface Summary {
    subtotal?: number;
    shipping_cost?: number;
    total_tax?: number;
    total_cost: number;
}

interface Adjustment {
    name: string;
    amount: number;
}

export class ReceiptElement {
    title: string;
    subtitle?: string;
    quantity?: number;
    price: number;
    currency?: string;
    image_url?: string;

    constructor(title: string, price: number) {
        this.title = title;
        this.price = price;
    }

    setSubtitle(subtitle: string): ReceiptElement {
        this.subtitle = subtitle;
        return this;
    }

    setQuantity(quantity: number): ReceiptElement {
        this.quantity = quantity;
        return this;
    }

    setCurrency(currency: string): ReceiptElement {
        this.currency = currency;
        return this;
    }

    setImageUrl(imageUrl: string): ReceiptElement {
        this.image_url = imageUrl;
        return this;
    }

    toJSON() {
        return {
            title: this.title,
            subtitle: this.subtitle,
            quantity: this.quantity,
            price: this.price,
            currency: this.currency,
            image_url: this.image_url,
        };
    }
}

export class ReceiptTemplate {
    private sharable?: boolean;
    private recipient_name: string;
    private merchant_name?: string;
    private order_number: string;
    private order_url?: string;
    private currency: string;
    private payment_method: string;
    private timestamp?: string;
    private elements: ReceiptElement[];
    private address?: Address;
    private summary: Summary;
    private adjustments?: Adjustment[];

    constructor(
        recipient_name: string,
        order_number: string,
        currency: string,
        payment_method: string,
        { sharable = false }: { sharable?: boolean } = {},
    ) {
        this.recipient_name = recipient_name;
        this.order_number = order_number;
        this.currency = currency;
        this.payment_method = payment_method;
        this.sharable = sharable;
        this.elements = [];
        this.summary = { total_cost: 0 };
    }

    setMerchantName(merchant_name: string): ReceiptTemplate {
        this.merchant_name = merchant_name;
        return this;
    }

    setOrderUrl(order_url: string): ReceiptTemplate {
        this.order_url = order_url;
        return this;
    }

    setTimestamp(timestamp: string): ReceiptTemplate {
        this.timestamp = timestamp;
        return this;
    }

    setAddress(address: Address): ReceiptTemplate {
        this.address = address;
        return this;
    }

    setSummary(summary: Summary): ReceiptTemplate {
        this.summary = { ...this.summary, ...summary };
        return this;
    }

    addAdjustment(adjustment: Adjustment): ReceiptTemplate {
        if (!this.adjustments) {
            this.adjustments = [];
        }
        this.adjustments.push(adjustment);
        return this;
    }

    addElement(element: ReceiptElement): ReceiptTemplate {
        if (this.elements.length >= 100) {
            throw new Error('Receipt template supports a maximum of 100 elements');
        }
        this.elements.push(element);
        return this;
    }

    toJSON() {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'receipt',
                    sharable: this.sharable,
                    recipient_name: this.recipient_name,
                    merchant_name: this.merchant_name,
                    order_number: this.order_number,
                    order_url: this.order_url,
                    currency: this.currency,
                    payment_method: this.payment_method,
                    timestamp: this.timestamp,
                    elements: this.elements,
                    address: this.address,
                    summary: this.summary,
                    adjustments: this.adjustments,
                },
            },
        };
    }
}
