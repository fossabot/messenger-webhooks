import type { EventType } from '@/types';
import type { Express, Request, Response } from 'express';

import { GRAPH_URL } from '@/constants';
import { determineEventType, logger } from '@/utils';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import EventEmitter from 'events';
import express from 'express';

interface Options {
    accessToken: string;
    verifyToken: string;
    port?: number;
    endpoint?: string;
    version?: string;
}

export class Bot extends EventEmitter {
    private readonly server: Express;
    private readonly accessToken: string;
    private readonly verifyToken: string;

    public bot: {
        id: string;
        name: string;
        port: number;
        endpoint: string;
        version: string;
    };

    constructor(options: Options) {
        super();

        this.server = express();
        this.accessToken = options.accessToken;
        this.verifyToken = options.verifyToken;
        this.bot = {
            id: '',
            name: '',
            port: options.port ?? 8080,
            endpoint: options.endpoint ?? '/webhook',
            version: options.version ?? 'v19.0',
        };
    }

    /**
     * Starts the bot server and initializes the webhook endpoints.
     * @returns {void}
     */
    public start(): void {
        this.server.use(bodyParser.json());

        this.server.get(this.bot.endpoint, (req: Request, res: Response): void => {
            const {
                'hub.mode': mode,
                'hub.challenge': challenge,
                'hub.verify_token': verifyToken,
            } = req.query;

            if (mode && verifyToken) {
                if (mode === 'subscribe' && verifyToken === this.verifyToken) {
                    res.status(200).send(challenge);
                } else {
                    res.status(403).send('Forbidden');
                }
            } else {
                res.status(400).send('Bad Request');
            }
        });

        this.server.post(this.bot.endpoint, (req: Request, res: Response): void => {
            const { object, entry } = req.body;

            if (object !== 'page') {
                res.status(400).send('Bad Request');
                return;
            }

            for (const e of entry) {
                const messaging = e.messaging[0];
                const event = determineEventType(messaging);

                if (event) {
                    this.emit(event, messaging as EventType[keyof EventType]);
                }
            }

            res.sendStatus(200);
        });

        this.server.listen(this.bot.port, async (): Promise<void> => {
            if (!this.bot.id || !this.bot.name) {
                await this.getAppInfo().catch((error): void => {
                    if (error instanceof Error) {
                        logger.error('Error getting app info:', error.message);
                    } else {
                        logger.error('Error getting app info:', String(error));
                    }
                });
            }

            logger.info(
                `${this.bot.name} ${chalk.gray(`(${this.bot.id})`)} is running on port ${chalk.yellow(this.bot.port)} ${chalk.gray(
                    `(${this.bot.endpoint})`,
                )}`,
            );
        });
    }

    public async sendRequest<T>(
        method: 'GET' | 'POST',
        endpoint: string,
        requestBody?: Record<string, unknown>,
    ): Promise<T> {
        const response = await fetch(
            `${GRAPH_URL}/${this.bot.version}/${endpoint}?access_token=${this.accessToken}`,
            {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody ? JSON.stringify(requestBody) : undefined,
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error!: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    private async getAppInfo(): Promise<void> {
        interface AppInfo {
            id: string;
            name: string;
        }

        const response = await this.sendRequest<AppInfo>('GET', 'me');
        this.bot.id = response.id;
        this.bot.name = response.name;
    }

    /**
     * Sends a message to a recipient with custom message object.
     * @param {string} recipientId - The ID of the recipient.
     * @param {object} message - The message object to send.
     * @returns {Promise<void>}
     */
    public async sendMessage(recipientId: string, message: object): Promise<void> {
        return await this.sendRequest('POST', '/me/messages', {
            recipient: { id: recipientId },
            message,
        });
    }

    /**
     * Sends a text message to a recipient.
     * @param {string} recipientId - The ID of the recipient.
     * @param {string} message - The text message to send.
     * @returns {Promise<void>}
     */
    public async sendTextMessage(recipientId: string, message: string): Promise<void> {
        return await this.sendRequest('POST', '/me/messages', {
            recipient: { id: recipientId },
            message: { text: message },
        });
    }

    /**
     * Sends an attachment to a recipient.
     * @param {string} recipientId - The ID of the recipient.
     * @param {string} type - The type of attachment to send. (image, video, audio, file)
     * @param {string} url - The URL of the attachment to send.
     * @param {boolean} isReusable - Whether the attachment is reusable.
     * @returns {Promise<void>}
     */
    public async sendAttachment(
        recipientId: string,
        type: 'image' | 'video' | 'audio' | 'file',
        url: string,
        isReusable: boolean,
    ): Promise<void> {
        return await this.sendRequest('POST', 'me/messages', {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type,
                    payload: {
                        url,
                        is_reusable: isReusable,
                    },
                },
            },
        });
    }

    public async setTyping(recipientId: string, isTyping: boolean): Promise<void> {
        return await this.sendRequest('POST', '/me/messages', {
            recipient: { id: recipientId },
            sender_action: isTyping ? 'typing_on' : 'typing_off',
        });
    }
}
