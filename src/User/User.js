import crypto from "crypto";
import UserData from "./UserData";
import { PrismaClient } from '@prisma/client';

// Размер идентификатора сессии
const sessionBytesLength = 16;

export default class User {
    _wsSocket = null; // Вебсокет
    _httpSocket = null; // HTTP-сокет
    _sessionId = ""; // Идентификатор сессии
    _token = null; // Токен авторизации юзера
    _data = null; // Данные юзера (UserData)

    /**
     * Получение идентификатора игрока
     * 
     * @getter
     * @public
     * @this User
     * @returns {Number}
     */
    get id() {
        return this._data.get('id') || 0;
    }

    /**
     * Получение токена игрока
     * 
     * @getter
     * @public
     * @this User
     * @returns {Buffer|String|null}
     */
    get token() {
        return this._token;
    }

    /**
     * Базовый конструктор
     * 
     * @constructor
     * @param {Object} [user]
     * @this User
     * @returns {User}
     */
    constructor(data = null) {
        this._data = new UserData(data || {});
    }
    
    /**
     * Генерация идентификатора сессии
     * 
     * @public
     * @this User
     * @returns {String}
     */
    generateSessionId() {
        if (this._sessionId)
            throw new Error(`[User -> generateSessionId] sessionId is already generated.`);

        this._sessionId = crypto.randomBytes(sessionBytesLength).toString('base64');
        return this._sessionId;
    }



    /**
     * Сохранение юзера в базе данных
     * 
     * @async
     * @public
     * @param {PrismaClient} [db]
     * @this User
     * @returns {Promise<void>}
     */
    async save(db = null) {
        let needDisconnect = false;

        if (!db) {
            db = new PrismaClient();
            needDisconnect = true;
        }
            
        await db.user.update({
            where: {
                id: this.id, 
            },
            data: this._data.toJSON(),
        });

        if (needDisconnect)
            await db.$disconnect();
    }
}