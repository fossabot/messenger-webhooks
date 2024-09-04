import chalk from 'chalk';

const prefix = chalk.gray('[bot]');

export const logger = {
    log: (...args: unknown[]): void => {
        console.log(prefix, ...args);
    },
    info: (...args: unknown[]): void => {
        console.log(prefix, chalk.blue('[info]'), ...args);
    },
    warn: (...args: unknown[]): void => {
        console.log(prefix, chalk.yellow('[warn]'), ...args);
    },
    error: (...args: unknown[]): void => {
        console.log(prefix, chalk.red('[error]'), ...args);
        process.exit(1);
    },
};
