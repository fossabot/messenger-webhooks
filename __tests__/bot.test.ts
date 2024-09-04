import type { Mock } from 'vitest';

import { Bot } from '@pyyupsk/messenger-webhooks';
import { request } from 'undici';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

vi.mock('undici', () => ({
    request: vi.fn(),
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

    it('should initialize with correct default properties', () => {
        expect(bot.bot.port).toBe(8080);
        expect(bot.bot.endpoint).toBe('/webhook');
        expect(bot.bot.version).toBe('v19.0');
    });

    it('should initialize with custom properties', () => {
        const customBot = new Bot({
            accessToken: 'custom_access_token',
            verifyToken: 'custom_verify_token',
            port: 3000,
            endpoint: '/custom-webhook',
            version: 'v18.0',
        });

        expect(customBot.bot.port).toBe(3000);
        expect(customBot.bot.endpoint).toBe('/custom-webhook');
        expect(customBot.bot.version).toBe('v18.0');
    });

    it('should send a text message', async () => {
        (request as unknown as Mock).mockResolvedValue({
            statusCode: 200,
            body: { json: vi.fn().mockResolvedValue({ message_id: 'mid.123' }) },
        });

        await bot.sendTextMessage('123', 'Hello, user!');

        expect(request).toHaveBeenCalledWith(
            expect.stringContaining('/me/messages'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    recipient: { id: '123' },
                    message: { text: 'Hello, user!' },
                }),
            }),
        );
    });

    it('should handle errors when sending a text message', async () => {
        (request as unknown as Mock).mockRejectedValue(new Error('Network error'));

        await expect(bot.sendTextMessage('123', 'Hello, user!')).rejects.toThrow('Network error');
    });

    it('should handle webhook verification', () => {
        bot.start();

        expect(mockGet).toHaveBeenCalledWith('/webhook', expect.any(Function));

        const mockReq = {
            query: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'test_verify_token',
                'hub.challenge': 'challenge_token',
            },
        };
        const mockRes = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };

        const verifyHandler = mockGet.mock.calls[0]?.[1];
        verifyHandler?.(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith('challenge_token');
    });

    it('should handle invalid webhook verification', () => {
        bot.start();

        const mockReq = {
            query: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'invalid_token',
                'hub.challenge': 'challenge_token',
            },
        };
        const mockRes = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };

        const verifyHandler = mockGet.mock.calls[0]?.[1];
        verifyHandler?.(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.send).toHaveBeenCalledWith('Forbidden');
    });

    it('should handle webhook POST requests', () => {
        bot.start();

        expect(mockPost).toHaveBeenCalledWith('/webhook', expect.any(Function));

        const mockReq = {
            body: {
                object: 'page',
                entry: [
                    {
                        messaging: [
                            {
                                sender: { id: '123' },
                                message: { text: 'Hello, bot!' },
                            },
                        ],
                    },
                ],
            },
        };
        const mockRes = {
            sendStatus: vi.fn(),
        };

        const postHandler = mockPost.mock.calls[0]?.[1];
        postHandler?.(mockReq, mockRes);

        expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should reject non-page webhook POST requests', () => {
        bot.start();

        const mockReq = {
            body: {
                object: 'not_page',
                entry: [],
            },
        };
        const mockRes = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };

        const postHandler = mockPost.mock.calls[0]?.[1];
        postHandler?.(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith('Bad Request');
    });

    it('should emit events based on incoming messages', () => {
        const mockEmit = vi.spyOn(bot, 'emit');
        bot.start();

        const mockReq = {
            body: {
                object: 'page',
                entry: [
                    {
                        messaging: [
                            {
                                sender: { id: '123' },
                                message: { text: 'Hello, bot!' },
                            },
                        ],
                    },
                ],
            },
        };
        const mockRes = {
            sendStatus: vi.fn(),
        };

        const postHandler = mockPost.mock.calls[0]?.[1];
        postHandler?.(mockReq, mockRes);

        expect(mockEmit).toHaveBeenCalledWith('message', expect.any(Object));
    });

    it('should start the server on the specified port', () => {
        bot.start();

        expect(mockListen).toHaveBeenCalledWith(8080, expect.any(Function));
    });
});
