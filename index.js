import app from "./Application";

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
            app.stop()
        ]);
    } catch(e) {

    }
});
