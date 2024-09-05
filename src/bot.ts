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

        if (!options.accessToken) {
            logger.error(
                'Access token is required: https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start',
            );
        }
        if (!options.verifyToken) {
            logger.error(
                'Verify token is required: https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start',
            );
        }

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

    /**
     * Sends a request to the Facebook Graph API.
     * @param {string} method - The HTTP method to use.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {Record<string, unknown>} requestBody - The request body to send.
     * @returns {Promise<T>} - The response from the Facebook Graph API.
     */
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
        const json = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error!: ${response.statusText}`, {
                cause: json,
            });
        }

        return json as Promise<T>;
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
     * @throws {Error} If the message exceeds 2000 characters.
     */
    public async sendTextMessage(recipientId: string, message: string): Promise<void> {
        if (message.length > 2000) {
            throw new Error('Message exceeds 2000 character limit');
        }
        return await this.sendRequest('POST', '/me/messages', {
            recipient: { id: recipientId },
            message: { text: message },
        });
    }

    /**
     * Sends an attachment to a recipient.
     * @param {string} recipientId - The ID of the recipient.
     * @param {'audio' | 'file' | 'image' | 'video' | 'template'} type - The type of attachment to send.
     * @param {string} url - The URL of the attachment to send.
     * @param {boolean} isReusable - Whether the attachment is reusable. Defaults to true.
     * @returns {Promise<void>}
     */
    public async sendAttachment(
        recipientId: string,
        type: 'audio' | 'file' | 'image' | 'video' | 'template',
        url: string,
        isReusable: boolean = true,
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

    /**
     * Sets the typing status for a recipient.
     * @param {string} recipientId - The ID of the recipient.
     * @param {boolean} isTyping - Whether the bot is typing.
     * @returns {Promise<void>}
     */
    public async setTyping(recipientId: string, isTyping: boolean): Promise<void> {
        return await this.sendRequest('POST', '/me/messages', {
            recipient: { id: recipientId },
            sender_action: isTyping ? 'typing_on' : 'typing_off',
        });
    }
}
