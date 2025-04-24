import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Config from './config';

const writeFileAsync = promisify(fs.appendFile);

class Logger {

    private static ensureLogsDirectory(): string {
        const logsDir = path.resolve(__dirname, '../../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        return logsDir;
    }

    private static get logFilePath(): string {
        const date = new Date();
        const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const logsDir = this.ensureLogsDirectory();
        return path.join(logsDir, `error-${dateString}.log`);
    }

    static async error(message: string | Error | unknown, serviceOrFunction: string): Promise<void> {
        const dateNow = new Date().toISOString();
        const fileName = path.basename(__filename);
        const errorMessage = message instanceof Error ? message.stack || message.message : message;

        const formattedMessage = 
`[ERROR] ${dateNow} - ${errorMessage}
[DETAILS] File: ${fileName}, Function: ${serviceOrFunction}
------------------------------------------------------------
`;

        if (Config.instance().isInProduction()) {
            try {
                await writeFileAsync(this.logFilePath, formattedMessage);
            } catch (err) {
                console.error(formattedMessage);
            }
        } else {
            console.error(formattedMessage);
        }
    }

    static info(message: string): void {
        const formattedMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
        if (Config.instance().isInProduction()) {
            console.log(formattedMessage);
        } else {
            // Cyan no terminal
            console.log(`\x1b[36m%s\x1b[0m`, formattedMessage);
        }
    }
}

export default Logger;