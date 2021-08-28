import HttpServer from "./HttpServer";
import WebSocketServer from "./WebSocketServer";

class Application {
    _httpServer = null;
    _wsServer = null;
    _terminating = false;
    _players = [];
    _gameRooms = [];

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
        this._wsServer           = new WebSocketServer();
        this._terminating        = false;
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

        // Initialize WebSocket-Server
        await this._wsServer.init();
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
        this._terminating = true;

        await Promise.all([
            this._httpServer.stop(),
            this._wsServer.stop(),
        ]);
    }
}

const app = Application.Instance;

export default app;
