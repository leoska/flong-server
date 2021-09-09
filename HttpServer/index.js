import express               from 'express';
import fsExtra               from 'fs-extra';
import path                  from 'path';
import http                  from 'http';
import ErrorApiMethod        from '../ErrorApiMethod';
import colors                from 'colors';

const DEFAULT_HTTP_HOST = "0.0.0.0";
const DEFAULT_HTTP_PORT = 25565;

// Базовый класс Http сервера, который поднимается в Application
export default class HttpServer {
    _server = null;
    _app = null;
    _api = {};

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this HttpServer
     */
    constructor() {
        this._app = express();
    }

    /**
     * Инициализация Http-Server'а
     * 
     * @async
     * @public
     * @this HttpServer
     * @returns {Promise<void>}
     */
    async init() {
        // Initialize API
        await this._initApi();

        // Initialize Express Routes
        this._initExpress();

        // Initialize http-server
        this.server = http.createServer(this._app);

        const options = {
            host: DEFAULT_HTTP_HOST,
            port: DEFAULT_HTTP_PORT,
        };

        // Listen http-server
        this.server.listen(options, () => {
            console.info(colors.blue("[HTTP-Server] Successfully initialized and started API http-server."));
        });
    }

    /**
     * Остановка сервера
     * 
     * 
     */
    async stop() {
        this.server.close(() => {
            console.info(colors.blue("[HTTP-Server] Successfully stoped."));
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
                            
                            if (apiModule.isApi && apiModule.isApi()) {
                                console.log(`[HTTP-Server] API ${apiModule.name} successfully initialized.`);
                                this._api[apiName] = apiModule;
                            }
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
        // Обработка POST/GET запросов классами API
        const responseHandler = async (req, res, method) => {
            // req.headers["x-forwarded-for"] <-- этот заголовок обычно вкладывается NGINX'ом
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            const apiName = req.params.apiName;
            const reqBody = Object.assign({}, req.query, req.body);

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
                    console.error(`[HTTP-Server] ${e.message}`);
                    
                    res.status(e.status);
                    res.end(JSON.stringify({
                        error: e.code,
                        stack: e.stack,
                    }));
                } else {
                    // Обработка INTERNAL_SERVER_ERROR (500)
                    console.error(colors.red(`[HTTP-Server] Request API [${apiName}] failed.\n${e.stack}`));

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
