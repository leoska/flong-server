import app from "./Application";
import { timeout } from "./utils";
import colors from 'colors';

// Время ожидания остановки процееса (в миллисекундах)
const EXIT_MAX_WAIT = 10000; // 10 secs

try {
    (async () => {
        await app.init();
    })();
} catch(e) {
    console.error(`Application can't start corrent: ${e}`);
    process.exit(1);
}

// Обработка остановки сервера
process.on('SIGINT', async () => {
    try {
        console.warn(colors.bgRed(`Received SIGINT signal! Application try to stop.`));

        await Promise.race([
            app.stop(),
            timeout(EXIT_MAX_WAIT),
        ]);
    } catch(e) {
        console.error(`Application can't stop correct: ${e}`);
        process.exit(1);
    }

    process.exit(0);
});
