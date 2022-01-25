import express               from 'express';
import fsExtra               from 'fs-extra';
import path                  from 'path';
import http                  from 'http';
import ErrorApiMethod        from '../ErrorApiMethod';
import colors                from 'colors';
import Application           from '../Application';

const DEFAULT_HTTP_HOST = "0.0.0.0";
const DEFAULT_HTTP_PORT = 25565;

const _initApi = Symbol('_initApi');
const _initExpress = Symbol('_initExpress');

// Базовый класс Http сервера, который поднимается в Application
export default class HttpServer {
    _server = null;
    _app = null;

    // В объект api кладутся поддерживаемые АПИ-методы
    // _api = {
    //     'GET': {},
    //     'POST': {},
    // };
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
        await this[_initApi]();

        // Initialize Express Routes
        this[_initExpress]();

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
     * @async
     * @public
     * @this HttpServer
     * @returns {Promise<void>}
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
     * @returns {Promise<void>}
     */
    async [_initApi]() {
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
                                if (this._api[apiName])
                                    throw new Error(`[HTTP-Server] API ${apiName} is already initialized!`);

                                console.log(colors.green(`[HTTP-Server] API ${apiModule.name} successfully initialized.`));
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
    [_initExpress]() {
        // Обработка POST/GET запросов классами API
        const responseHandler = async (req, res, method) => {
            // req.headers["x-forwarded-for"] <-- этот заголовок обычно вкладывается NGINX'ом
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            const apiName = req.params.apiName;
            const reqParams = Object.assign({}, req.query);
            const reqBody = Object.assign({}, req.body);
            const reqHeaders = Object.assign({}, req.headers);

            try {
                // Обработка SERVER_TERMINATING (503)
                if (Application.terminating) {
                    throw new ErrorApiMethod(`Failed to call API [${apiName}]. code: SERVER_TERMINATING`, "SERVER_TERMINATING", 503);
                }
                
                // Обработка Not Implemented (501)
                const api = this._api[apiName];

                if (!api) {
                    throw new ErrorApiMethod(`API [${apiName}] NOT FOUND!`, "API_NOT_FOUND", 501);
                }
                
                const apiInstance = new api(method);
                apiInstance.params = reqParams;
                apiInstance.body = reqBody;
                apiInstance.headers = reqHeaders;

                // 200 - OK
                res.json(await apiInstance.callProcess());
            } catch(e) {
                let response;

                if (e instanceof ErrorApiMethod) {
                    console.error(colors.red(`[HTTP-Server] ${e.stack || e.message}`));
                    
                    // Можно просто отправить статус
                    // res.sendStatus(e.status);

                    res.status(e.status);
                    response = JSON.stringify({
                        error: e.code,
                        message: e.message,
                        stack: e.stack,
                    });
                } else {
                    // Обработка INTERNAL_SERVER_ERROR (500)
                    console.error(colors.red(`[HTTP-Server] Request API [${apiName}] failed.\n${e.stack}`));

                    res.status(500);
                    response = JSON.stringify({
                        error: "INTERNAL_SERVER_ERROR",
                        message: e.message,
                        // TODO: закомментировал пока e.stack, не вижу в нём необходимость
                        // stack: e.stack,
                    });
                }

                // Добавляем заголовок, что тип ответа - json и размер ответа
                res.header("Content-Type", "application/json; charset=utf-8");
                res.header("Content-Length", Buffer.byteLength(response, "utf-8"));

                // Отправляем ответ
                res.end(response);
            }
        };
        
        // Добавляем заголовки в middleware
        this._app.use((req, res, next) => {
            // Добавляем заголовки во избежания CORS политик
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });

        // Конвертируем всё в json
        this._app.use(express.json());

        // Роутинг POST-методов
        this._app.post("/api/:apiName", (req, res) => responseHandler(req, res, 'POST'));
        // Роутинг GET-методов
        this._app.get("/api/:apiName", (req, res) => responseHandler(req, res, 'GET'));
        // Роутинг PUT-методов
        this._app.put("/api/:apiName", (req, res) => responseHandler(req, res, 'PUT'));
    }
}
