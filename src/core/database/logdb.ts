import fs from "fs";
import path from "path";
import Config from "../../util/config";

const isInProduction = Config.instance().isInProduction();

const logDir = path.resolve(__dirname, "../../logs");
if (isInProduction && !fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function formatLog(level: string, code: number | null, message: string, file: string, func: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${code ? `Code ${code} - ` : ""}${message} | File: ${file} | Function: ${func}\n`;
}

export default {
    error(code: number, message: string, file: string, func: string) {
        
        const formatted = formatLog("error", code, message, file, func);

        if (!isInProduction) {
            console.error(formatted);
        } else {
            const filePath = path.join(logDir, "error.log");
            fs.appendFile(filePath, formatted, (err) => {
                if (err) console.error("Erro ao salvar log:", err);
            });
        }

    },

    info(message: string, file: string, func: string) {
        
        const formatted = formatLog("info", null, message, file, func);
        
        if (!isInProduction) {
            console.info(formatted);
        }

    }
};