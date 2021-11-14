import colors from "colors";

const _onMessage = Symbol('_onMessage');
const _onError = Symbol('_onError');
const _onClose = Symbol('_onClose');
const _onOpen = Symbol('_onOpen');

/**
 * Базовый класс WebSocket клиента для WebSocketServer
 *  
 */ 
export default class WebSocketClient {

    _webSocket = null;
    _isClose = true;

    /**
     * Базовый конструктор
     * 
     * @public
     * @param {WebSocket} webSocket
     * @this WebSocketClient
     * @returns {WebSocketClient}
     */
    constructor(webSocket) {
        webSocket.on("error", this[_onError].bind(this));
        webSocket.on('message', this[_onMessage].bind(this));
        webSocket.once('close', this[_onClose].bind(this));
        webSocket.once('open', this[_onClose].bind(this));

        this._webSocket = webSocket;
    }

    /**
     * Получение сообщения от клиента
     * 
     * @async
     * @private
     * @param {Buffer|ArrayBuffer|Buffer[]} data 
     * @param {Boolean} isBinary 
     * @this WebSocketClient
     * @returns {Promise<void>}
     */
    async [_onMessage](data, isBinary) {
        // Убираем finalized with a null terminating character. - .replace(/\0/g, '');
        // В случае, если используем buffer_string. buffer_text без null terminating character

        const decodeData = data.toString('utf8');
        try {
            const dataJson = JSON.parse(decodeData);
        } catch(err) {

        } finally {
            console.log({data, isBinary, decodeData});
        }
    }

    /**
     * Обработчик ошибок на сокете
     * 
     * @private
     * @param {Error} err 
     * @this WebSocketClient
     * @returns {Promise<void>}
     */
    [_onError](err) {
        console.error(colors.red(err.stack));
    }
    
    /**
     * Событие закрытие сокета
     * 
     * @private
     * @param {Number} code
     * @param {Buffer} reason
     * @this WebSocketClient
     * @returns {Promise<void>}
     */
    [_onClose](code, reason) {
        console.info(colors.green(`[WebSocketClient] Connection is established`));
        this._isClose = true;
    }

    /**
     * Событие открытие сокета
     */
    [_onOpen]() {
        this._isClose = false;
    }
}