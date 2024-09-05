import type { Request, Response } from 'express';

import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import { Bot } from '../src/bot';

const mockGet = vi.fn();
const mockUse = vi.fn();
const mockPost = vi.fn();
const mockListen = vi.fn();
const mockJson = vi.fn();

vi.mock('express', () => ({
    default: vi.fn(() => ({
        use: mockUse,
        get: mockGet,
        post: mockPost,
        listen: mockListen,
        json: mockJson,
    })),
}));

vi.mock('body-parser', () => ({
    default: {
        json: vi.fn(),
    },
}));

vi.mock('@/utils', () => ({
    determineEventType: vi.fn(),
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Bot', () => {
    let bot: Bot;

    beforeEach(() => {
        bot = new Bot({
            accessToken: 'test_access_token',
            verifyToken: 'test_verify_token',
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with correct options', () => {
        expect(bot['accessToken']).toBe('test_access_token');
        expect(bot['verifyToken']).toBe('test_verify_token');
        expect(bot.bot.port).toBe(8080);
        expect(bot.bot.endpoint).toBe('/webhook');
        expect(bot.bot.version).toBe('v19.0');
    });

    it('should handle GET requests for webhook verification', () => {
        bot.start();

        const [path, handler] = mockGet.mock.calls[0] ?? [];
        expect(path).toBe('/webhook');

        const mockReq = {
            query: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'test_verify_token',
                'hub.challenge': 'challenge_token',
            },
        } as unknown as Request;
        const mockRes = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as unknown as Response;

        handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith('challenge_token');
    });

    it('should handle POST requests for webhook events', () => {
        bot.start();

        const [path, handler] = mockPost.mock.calls[0] ?? [];
        expect(path).toBe('/webhook');

        const mockReq = {
            body: {
                object: 'page',
                entry: [{ messaging: [{ message: 'test' }] }],
            },
        } as unknown as Request;
        const mockRes = {
            sendStatus: vi.fn(),
        } as unknown as Response;

        handler(mockReq, mockRes);

        expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should send a text message', async () => {
        vi.spyOn(bot, 'sendRequest').mockResolvedValue({});

        await bot.sendTextMessage('recipient_id', 'Hello, world!');

        expect(bot.sendRequest).toHaveBeenCalledWith('POST', '/me/messages', {
            recipient: { id: 'recipient_id' },
            message: { text: 'Hello, world!' },
        });
    });

    it('should send an attachment', async () => {
        vi.spyOn(bot, 'sendRequest').mockResolvedValue({});

        await bot.sendAttachment('recipient_id', 'image', 'https://example.com/image.jpg', true);

        expect(bot.sendRequest).toHaveBeenCalledWith('POST', 'me/messages', {
            recipient: { id: 'recipient_id' },
            message: {
                attachment: {
                    type: 'image',
                    payload: {
                        url: 'https://example.com/image.jpg',
                        is_reusable: true,
                    },
                },
            },
        });
    });

    it('should set typing indicator', async () => {
        vi.spyOn(bot, 'sendRequest').mockResolvedValue({});

        await bot.setTyping('recipient_id', true);

        expect(bot.sendRequest).toHaveBeenCalledWith('POST', '/me/messages', {
            recipient: { id: 'recipient_id' },
            sender_action: 'typing_on',
        });
    });
});
