import { promisify } from "util";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import Platform from "./index";

/**
 * TODO: как самостоятельная платформа (возможно следует прикрутить firebase)
 */

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

// Все латинские буквы (большие и маленькие) + некоторые специальные символы и цифры (общая длина от 6 до 20 знаков)
const PASSWORD_REGEX = /^(?=.*?[a-zA-Z0-9])(?!.*?[=?<>()'"\/\&]).{6,20}$/;

// RFC 2822
// https://www.regular-expressions.info/email.html
const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

// Степень хэширования (соль)
const SALT_ROUNDS = 10;


export default class Html5 extends Platform {
    /**
     * Генерация bearer токена для авторизации
     * sign with RSA SHA256
     * 
     * @async
     * @public
     * @this Html5
     * @returns {String}
     */
    async generateToken() {
        this._token = await jwtSign({id: this.id}, privateKey, JWT_OPTIONS_SIGN);
        return this._token;
    }

        /**
     * Регистрация пользователя
     * 
     * @async
     * @public
     * @param {String} email
     * @param {String} password
     * @this Html5
     * @returns {Promise<any>}
     */
    async register(email, password) {
        // Проверяем почту
        if (!EMAIL_REGEX.test(email))
        throw new Error(`Email is invalid!`);

        // Проверяем пароль
        if (!PASSWORD_REGEX.test(password))
            throw new Error(`Password must contains only a characters, digits and special symbols. Length is minimum 8 and maximum 20.`);

        // Проверяем, существует ли такой юзер в базе данных
        const userAlreadyExists = await this._db.user.findFirst({
            select: {
                email: true,
                username: true,
            },
            where: {
                email
            },
        });

        if (userAlreadyExists)
            throw new Error(`User with mail: [${email}] is already exists.`);

        // Хэшируем пароль
        const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Создаём юзера в БД
        const userDb = await this._db.user.create({
            data: {
                email,
                password: Buffer.from(hashPassword),
                platform: 'html5',
            }
        });

        // Удаляем password из объекта, он не требуется в игровой логике
        delete userDb['password'];

        // Создаем объект User
        const user = new User(userDb);

        // Проверяем id юзера
        if (!user.id)
            throw new Error(`[Users -> register] user's id less that 1 or is null.`);

        // Генерируем идентификатор игровой сессии
        const sessionId = user.generateSessionId();

        // Генерируем JWT bearer токен
        const jwtToken = await user.generateToken();

        // Загружаем user'a в Users
        this.set(user.id, user);

        // Возвращаем первичные авторизационные данные
        return {
            id: user.id,
            sessionId,
            jwtToken: Buffer.from(jwtToken, 'utf-8').toString('base64'),
        }
    }

    /**
     * Авторизация пользователя
     * 
     * @async
     * @public
     * @param {String} email
     * @param {String} password
     * @this Html5
     * @returns {Promise<any>}
     */
    async authorize(email, password) {
        // Проверяем почту
        if (!EMAIL_REGEX.test(email))
            throw new Error(`Email is invalid!`);

        // Проверяем пароль
        if (!PASSWORD_REGEX.test(password))
            throw new Error(`Password must contains only a characters, digits and special symbols. Length is minimum 8 and maximum 20.`);

        // Пытаемся достать юзера из базы данных
        const userDb = await this._db.user.findFirst({
            where: {
                email,
            },
        });

        if (!userDb)
            throw new Error(`User with mail: [${email}] is not exists.`);

        // Проверяем пароль
        const match = await bcrypt.compare(password, userDb.password);
        if (!match)
            throw new Error(`Incorrect password!`);

        // Удаляем password из объекта, он не требуется в игровой логике
        delete userDb['password'];

        // Проверяем, не загружен ли юзер уже
        if (this.has(userDb.id)) {
            const user = this.get(userDb.id);

            // Проверяем находится ли игрок сейчас в игровой сессии
            if (user.status === "playing") {
                
            }
        } else {
            // Создаем объект User
            const user = new User(userDb);

            // Генерируем идентификатор игровой сессии
            const sessionId = user.generateSessionId();

            // Генерируем JWT bearer токен
            const jwtToken = await user.generateToken();
        }
        // Загружаем user'a в Users
        this.set(user.id, user);
    }
}