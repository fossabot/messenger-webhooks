import type express from 'express';

import { Bot, logger } from '@lib';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Bot Class Tests', () => {
    let bot: InstanceType<typeof Bot>;
    let mockExpress: ReturnType<typeof express>;
    let mockFetch: ReturnType<typeof vi.fn>;

    const mockOptions = {
        accessToken: 'mockAccessToken',
        verifyToken: 'mockVerifyToken',
        port: 8080,
        endpoint: '/webhook',
        version: 'v19.0',
    };

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch; // Mocking fetch for HTTP requests

        // Mock express server
        mockExpress = {
            use: vi.fn(),
            get: vi.fn(),
            post: vi.fn(),
            listen: vi.fn(),
        } as unknown as ReturnType<typeof express>;

        // Mock logger
        vi.spyOn(logger, 'error').mockImplementation(() => {});
        vi.spyOn(logger, 'info').mockImplementation(() => {});

        bot = new Bot(mockOptions);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with the provided options', () => {
        expect(bot.bot.port).toBe(mockOptions.port);
        expect(bot.bot.endpoint).toBe(mockOptions.endpoint);
        expect(bot.bot.version).toBe(mockOptions.version);
        expect(bot['accessToken']).toBe(mockOptions.accessToken);
        expect(bot['verifyToken']).toBe(mockOptions.verifyToken);
    });

    it('should throw an error if accessToken is missing', () => {
        const badOptions = { ...mockOptions, accessToken: '' };
        new Bot(badOptions); // Create new bot with bad options
        expect(logger.error).toHaveBeenCalledWith(
            'Access token is required: https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start',
        );
    });

    it('should start the server and set up the webhook endpoints', () => {
        bot['server'] = mockExpress;

        bot.start();
        expect(mockExpress.use).toHaveBeenCalledWith(expect.any(Function));
        expect(mockExpress.get).toHaveBeenCalledWith(bot.bot.endpoint, expect.any(Function));
        expect(mockExpress.post).toHaveBeenCalledWith(bot.bot.endpoint, expect.any(Function));
        expect(mockExpress.listen).toHaveBeenCalledWith(bot.bot.port, expect.any(Function));
    });

    it('should start the server with options', () => {
        bot = new Bot({
            accessToken: 'mockAccessToken',
            verifyToken: 'mockVerifyToken',
            port: 3000,
            endpoint: '/api/webhook',
            version: 'v20.0',
        });

        expect(bot.bot.port).toBe(3000);
        expect(bot.bot.endpoint).toBe('/api/webhook');
        expect(bot.bot.version).toBe('v20.0');
    });

    it('should call sendRequest with correct parameters when sending a message', async () => {
        const sendRequestSpy = vi.spyOn(bot, 'sendRequest').mockResolvedValueOnce({});

        const recipientId = '123456';
        const message = { text: 'Hello!' };

        await bot.sendMessage(recipientId, message);

        expect(sendRequestSpy).toHaveBeenCalledWith('POST', '/me/messages', {
            recipient: { id: recipientId },
            message,
        });
    });

    it('should throw an error when sendTextMessage exceeds 2000 characters', async () => {
        const longMessage = 'a'.repeat(2001); // Create a string longer than 2000 chars

        await expect(bot.sendTextMessage('123', longMessage)).rejects.toThrow(
            'Message exceeds 2000 character limit',
        );
    });

    it('should call fetch with the correct URL and method in sendRequest', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '123', name: 'TestBot' }),
        });

        const result = await bot.sendRequest('GET', 'me');

        expect(mockFetch).toHaveBeenCalledWith(
            `${process.env.GRAPH_URL || 'https://graph.facebook.com'}/v19.0/me?access_token=${mockOptions.accessToken}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: undefined,
            },
        );
        expect(result).toEqual({ id: '123', name: 'TestBot' });
    });
});
