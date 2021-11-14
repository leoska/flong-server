import ws from "ws";
import colors from "colors";
import WebSocketClient from "./WebSocketClient";

const DEFAULT_WS_PORT = 25569;

// Базовый класс WebSocket сервера, который поднимается в Application
export default class WebSocketServer {
    _wsServer = null;
    _webSockets = [];

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this WebSocketServer
     * @returns {WebSocketServer}
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

        // Создание вебсокет сервера
        this._wsServer = new ws.Server(options, () => {
            console.info(colors.blue("[WebSocket-Server] Successfully initialized and started WebSocketServer."));
        });

        // Новое подключение к серверу
        this._wsServer.on('connection', (webSocket, req) => {
            // IP адрес клиента
            const ip = typeof(req.headers['x-forwarded-for']) === "string" ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.connection.remoteAddress;

            // Логируем о попытке подключении к серверу
            console.log(colors.green(`[WebSocket-Server] Connection from [${ip}] to url: [${req.url}]`));

            const socket = new WebSocketClient(webSocket);

            _webSockets.push(socket);



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