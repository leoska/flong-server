import colors from 'colors';
import util from 'util';
import path from 'path';
import fs from 'fs';

let logFile;
let errorFile;
let initialized = false;

export function initLog(stamp = Date.now()) {
    const basePath = path.join(process.cwd(), 'logs');

    const access = fs.existsSync(basePath);

    if (!access)
        fs.mkdirSync(basePath);

    const fLogName = path.join(basePath, `stdout_${stamp}.log`);
    const fErrorName = path.join(basePath, `stderr_${stamp}.log`);

    logFile = fs.createWriteStream(fLogName, { flags: 'a' });
    errorFile = fs.createWriteStream(fErrorName, { flags: 'a' });
    
    process.once('SIGINT', () => closeStreams());
    process.once('beforeExit', () => closeStreams());

    initialized = true;
}

function closeStreams() {
    try {
        logFile.end();
    } catch(e) {
        console.error(colors.red(e.stack));
    }

    try {
        errorFile.end();
    } catch(e) {
        console.error(colors.red(e.stack));
    }
}

function _checkInit() {
    if (!initialized)
        throw new Error(`Cannot write to file. Need initialize logger first.`);
}

export default {
    log: function() {
        const str = util.format.apply(null, arguments);

        try {
            _checkInit();
            logFile.write(`${(new Date()).toISOString()} ${str}\n`);
        } catch(e) {
            console.error(colors.red(e.stack));
        } finally {
            console.log(colors.green(str));
        }
    },

    info: function() {
        const str = util.format.apply(null, arguments);

        try {
            _checkInit();
            logFile.write(`${(new Date()).toISOString()} ${str}\n`);
        } catch(e) {
            console.error(colors.red(e.stack));
        } finally {
            console.info(colors.blue(str));
        }
    },

    warn: function() {
        const str = util.format.apply(null, arguments);

        try {
            _checkInit();
            errorFile.write(`${(new Date()).toISOString()} ${str}\n`);
        } catch(e) {
            console.error(colors.red(e.stack));
        } finally {
            console.warn(colors.yellow(str));
        }
    },

    error: function() {
        const str = util.format.apply(null, arguments);

        try {
            _checkInit();
            errorFile.write(`${(new Date()).toISOString()} ${str}\n`);
        } catch(e) {
            console.error(colors.red(e.stack));
        } finally {
            console.error(colors.red(str));
        }
    },
}