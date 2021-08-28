import ws from "ws";
import colors from "colors";

const DEFAULT_WS_PORT = 25569;

export default class WebSocketServer {
    _wsServer = null;

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this WebSocketServer
     */
    constructor() {

    }

    /**
     * Инициализация WebSocket сервера
     * 
     * @async
     * @public
     * @this WebSocketServer
     * @returns {Promise<void>}
     */
    async init() {
        const options = {
            port: DEFAULT_WS_PORT,
        }

        this._wsServer = new ws.Server(options);

        this._wsServer.on('connection', (webSocket, req) => {
            // IP адрес клиента
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            console.log(colors.green(`[WebSocket-Server] Connection from [${ip}] to url: [${req.url}]`));
            
            webSocket.send(`Connected success!`);
        });
    }

    /**
     * Остановка работы WebSocket сервера
     * 
     * @async
     * @public
     * @this WebSocketServer
     * @returns {Promise<void>}
     */
    async stop() {
        this._wsServer.close(() => {
            console.info(colors.blue("[WebSocket-Server] Successfully stoped."));
        });
    }
}