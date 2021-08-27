import app from "./Application";
import { timeout } from "utils";

const EXIT_MAX_WAIT = 10000;

try {
    (async () => {
        await app.init();
    })();
} catch(e) {
    console.error(`Application can't start corrent: ${e}`);
    process.exit(1);
}

process.on('SIGINT', async () => {
    try {
        await Promise.race([
            app.stop(),
            timeout(EXIT_MAX_WAIT),
        ]);
    } catch(e) {
        console.error(`Application can't stop correct: ${e}`);
        process.exit(1);
    }
});
