import fs from 'fs';
import path from 'path';
import Config from '../../util/config';
import Logger from '../../util/logger';

const isInProduction = Config.instance().isInProduction();

function ensureLogsDirectory(): string {
    const logsDir = path.resolve(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    return logsDir;
}

function getLogFilePath(): string {
    const date = new Date();
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const logsDir = ensureLogsDirectory();
    return path.join(logsDir, `error-db-${dateString}.log`);
}

function formatLog(level: string, code: number | null, message: string, file: string, func: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${code ? `Code ${code} - ` : ''}${message} | File: ${file} | Function: ${func}\n`;
}

const logDB = {
    error(code: number, message: string, file: string, func: string): void {
        const formatted = formatLog('error', code, message, file, func);

        if (!isInProduction) {
            console.error(formatted);
        } else {
            const filePath = getLogFilePath();
            fs.appendFile(filePath, formatted, (err) => {
                if (err) {
                    Logger.error(err, 'error');
                }
            });
        }
    },

    info(message: string, file: string, func: string): void {
        const formatted = formatLog('info', null, message, file, func);

        if (!isInProduction) {
            console.info(`\x1b[35m${formatted}\x1b[0m`);
        }
    }
};

export default logDB;