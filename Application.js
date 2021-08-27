import HttpServer from "./HttpServer";

class Application {
    _httpServer = null;

    /**
     * Статический геттер на единственный экземпляр данного класса (сингл-тон)
     * 
     * @static
     * @getter
     * @this Application
     * @returns {Application}
     */
    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Application
     */
    constructor() {
        this._httpServer         = new HttpServer();
    }

    /**
     * Инициализация приложения
     * 
     * @async
     * @public
     * @this Application
     * @returns {Promise<void>}
     */
    async init() {
        // Initialize Http-Server
        await this._httpServer.init();
    }

    /**
     * Остановка приложения
     * 
     * @async
     * @public
     * @this Application
     * @returns {Promise<void>}
     */
    async stop() {

    }
}

const app = Application.Instance;

export default app;
