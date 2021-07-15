import express               from 'express';
import fsExtra               from 'fs-extra';
import path                  from 'path';
import http                  from 'http';
import ErrorApiMethod        from './ErrorApiMethod';

const DEFAULT_HTTP_HOST = "0.0.0.0";
const DEFAULT_HTTP_PORT = 25565;

class Application {
    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    constructor() {
        this.server         = null;
        this._app           = express();
        this.terminating    = false;

        this._api           = {};
    }

    async init() {
        // Initialize API
        await this._initApi();

        console.log(this._api);

        // Initialize Express Routes
        await this._initExpress();

        // Initialize http-server
        this.server = http.createServer(this._app);

        const options = {
            host: DEFAULT_HTTP_HOST,
            port: DEFAULT_HTTP_PORT,
        };

        this.server.listen(options, () => {
            console.info("[Application] Successfully initialized and started API http-server.");
        });

    }

    /**
     * Функция инициализации API-методов
     * 
     * @async
     * @private
     * @this Application
     */
    async _initApi() {
        /**
         * Функция для возврата свойств файла/папки
         * 
         * @param {String} pathFile
         * @this _initApi
         * @return {Promise<(Error|null|Stats)>}
         */
        const getFileStats = (pathFile) => {
            return new Promise((resolve, reject) => {
                fsExtra.pathExists(pathFile, (err, exists) => {
                    if (err)
                        reject(err);

                    if (!exists)
                        reject(new Error(`ENOENT: no such file or directory: [${pathFile}]`));

                    fsExtra.stat(pathFile, (err, stats) => {
                        if (err)
                            reject(err);

                        resolve(stats);
                    });
                });
            });
        }

        /**
         * Функция сканирования папки
         *
         * @param {String} pathDir
         * @this _initApi
         * @returns {Promise<(Error|void)>}
         */
        const readDir = (pathDir) => {
            return new Promise((resolve, reject) => {
                const pathToRead = path.join(__dirname, 'api', pathDir);

                fsExtra.readdir(pathToRead, async (err, files) => {
                    if (err)
                        reject(err);

                    for (const file of files) {
                        const filePath = path.join(pathToRead, file);

                        const stats = await getFileStats(filePath);
                        if (stats.isDirectory()) {
                            await readDir(path.join(pathDir, file));
                        } else {
                            if (!(/^[^_].*\.js$/.test(file)))
                                continue;
                            
                            const subDirs = pathDir.split('/');
                            const apiName = (pathDir.length ? subDirs.join('.') + '.' : '') + file.substr(0, file.length - 3);
                            
                            const apiModule = require(filePath).default;
                            
                            if (apiModule.isApi && apiModule.isApi())
                                this._api[apiName] = apiModule;
                        }
                    }
                    
                    resolve();
                })
            });
        }
        
        await readDir('');
    }

    /**
     * Инициализация роутов для API-методов
     * 
     * @private
     * @this Application
     * @returns {void}
     */
    _initExpress() {
        // Обработка POST-запросов классами API
        const responseHandler = async (req, res, method) => {
            // req.headers["x-forwarded-for"] <-- этот заголовок обычно вкладывается NGINX'ом
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            const apiName = req.params.apiName;
            const reqBody = req.body;

            try {
                // Обработка SERVER_TERMINATING (503)
                if (this.terminating) {
                    throw new ErrorApiMethod(`Failed to call API [${apiName}]. code: SERVER_TERMINATING`, "SERVER_TERMINATING", 503);
                }
                
                // Обработка Not Implemented (501)
                const api = this._api[apiName];

                if (!api) {
                    throw new ErrorApiMethod(`API [${apiName}] NOT FOUND!`, "API_NOT_FOUND", 501);
                }
                
                const apiInstance = new api(method);
                apiInstance.setParams(reqBody);

                // 200 - OK
                res.json(await apiInstance.callProcess());
            } catch(e) {
                if (e instanceof ErrorApiMethod) {
                    console.error(`[Packer Daemon] ${e.message}`);
                    
                    res.status(e.status);
                    res.end(JSON.stringify({
                        error: e.code,
                        stack: e.getStack(),
                    }));
                } else {
                    // Обработка INTERNAL_SERVER_ERROR (500)
                    console.error(`[Packer Daemon] Request API [${apiName}] failed.\n${e.stack}`);

                    res.status(500);
                    res.end(JSON.stringify({
                        error: "INTERNAL_SERVER_ERROR",
                        stack: e.stack,
                    }));
                }
            }
        };
        
        this._app.post("/api/:apiName", (req, res) => responseHandler(req, res, 'POST'));
        this._app.get("/api/:apiName", (req, res) => responseHandler(req, res, 'GET'));
    }

}

const app = Application.Instance;

export default app;