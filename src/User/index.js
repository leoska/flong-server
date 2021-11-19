import crypto from "crypto";

// Размер идентификатора сессии
const sessionBytesLength = 16;

export default class User {
    _wsSocket = null; // Вебсокет
    _httpSocket = null; // HTTP-сокет
    _sessionId = ""; // Идентификатор сессии
    _id = 0; // Идентификатор игрока

    /**
     * 
     */
    constructor() {

    }
    
    /**
     * Генерация идентификатора сессии
     * 
     * @public
     * @this User
     * @returns {any}
     */
    generateSessionId() {
        if (this._sessionId)
            throw new Error(`[User -> generateSessionId] sessionId is already generated.`);

        this._sessionId = crypto.randomBytes(sessionBytesLength).toString('base64');
        return this._sessionId;
    }

    async save() {

    }
}