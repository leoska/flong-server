import HttpServer from "./HttpServer";
import Users from './Users';
import Protocol from './Protocol';
import config from '@modules/config';

const DEFAULT_CONFIG_ENV = 'develop';
const ARGV_CONFIG_ENV = process.argv[2] || '';

/**
 * Сингл-тон класс всего сервера
 * 
 * Возможно, буду использовать thread для поднятия игровых сессии.
 * Сервер в данном служит обычным "передатчиком" между клиентом и клиентом
 * Клиент, который начал сессию, является "сервером" -> он просчитывает физику и является валидирующим
 * 
 * Юзер сначала устанавливает соединение по Http, проходит этап авторизации, далее уставливает соединение по [Protocol]у
 * HTTP остается так же активным для управление сервером
 * 
 */
class Application {
    _httpServer = null;
    _gameServer = null;
    _terminating = false;
    _players = [];
    _gameRooms = [];

    /**
     * Статический геттер на единственный экземпляр данного класса (сингл-тон)
     * 
     * @static
     * @getter
     * @returns {Application}
     */
    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    /**
     * Геттер на переменную остановки сервера
     * 
     * @public
     * @getter
     * @this Application
     * @returns {Boolean}
     */
    get terminating() {
        return this._terminating;
    }

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Application
     * @returns {Application}
     */
    constructor() {
        const protocol = config('protocol');

        if (!Protocol[protocol])
            throw new Error(`[Application] undefined protocol type! [${protocol}]. Available protocols: [${(Object.keys(Protocol) || []).join(', ')}]`);

        this._httpServer         = new HttpServer();
        this._gameServer         = new Protocol[protocol].Server;
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

        // Initialize Game-Server
        await this._gameServer.init();
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
            this._gameServer.stop(),
            Users.stop(),
        ]);
    }
}

const app = Application.Instance;

export default app;
