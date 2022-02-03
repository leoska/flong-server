import crypto from "crypto";
import UserData from "./UserData";
import { PrismaClient } from '@prisma/client';
import { promisify } from "util";
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Размер идентификатора сессии
const sessionBytesLength = 16;

// Чтение ключей для jwt RS256 sign
const privateKey = fs.readFileSync(`${__dirname}/../../settings/jwtRS256.key`);
const pubKey = fs.readFileSync(`${__dirname}/../../settings/jwtRS256.key.public`);

// Настройка подписи JWT
// Алгоритм хэширования RS256
// Время жизни ключа - 1 день
const JWT_OPTIONS_SIGN = {
    algorithm: 'RS256',
    expiresIn: '1d',
};

const jwtSign = promisify(jwt.sign);

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
     * Генерация bearer токена для авторизации
     * sign with RSA SHA256
     * 
     * @async
     * @public
     * @this User
     * @returns {String}
     */
    async generateToken() {
        this._token = await jwtSign({id: this.id}, privateKey, JWT_OPTIONS_SIGN);
        return this._token;
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