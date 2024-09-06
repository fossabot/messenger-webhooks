import chalk from 'chalk';

const prefix = chalk.gray('[bot]');

/** A logger utility for logging messages with different severity levels. */
export const logger = {
    /**
     * Logs a general message.
     * @param args - The message or values to log.
     */
    log: (...args: unknown[]): void => {
        console.log(prefix, ...args);
    },

    /**
     * Logs an informational message, with a blue `[info]` tag.
     * @param args - The message or values to log.
     */
    info: (...args: unknown[]): void => {
        console.log(prefix, chalk.blue('[info]'), ...args);
    },

    /**
     * Logs a warning message, with a yellow `[warn]` tag.
     * @param args - The message or values to log.
     */
    warn: (...args: unknown[]): void => {
        console.log(prefix, chalk.yellow('[warn]'), ...args);
    },

    /**
     * Logs an error message, with a red `[error]` tag, and exits the process.
     * @param args - The message or values to log.
     */
    error: (...args: unknown[]): void => {
        console.log(prefix, chalk.red('[error]'), ...args);
        process.exit(1); // Exit the process with an error code
    },
};
