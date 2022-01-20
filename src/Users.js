import User from "./User";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import colors from 'colors';

const METHODS = [
    'set',
    'get',
    'has',
];

const PASSWORD_REGEX = /^(?=.*?[a-zA-Z0-9])(?!.*?[=?<>()'"\/\&]).{6,20}$/;

// RFC 2822
// https://www.regular-expressions.info/email.html
const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

// Степень хэширования (соль)
const SALT_ROUNDS = 10;

/**
 * Сигнлтоновский класс, список юзеров на сервере
 */
class Users {
    /**
     * Базовый конструктор
     * 
     * @constructor
     * @this Users
     * @returns {Users}
     */
    constructor() {
        Object.defineProperties(this, {
            _data: { value: new Map(), enumerable: false, configurable: false, writable: false },
            _db: {value: new PrismaClient(), enumerable: false, configurable: false, writable: false },
        });
    }

    /**
     * Остановка приложения
     * 
     * @async
     * @public
     * @this Users
     * @returns {Promise<void>}
     */
    async stop() {
        try {
            // Сохраняем всех юзеров в ДБ
            await this.saveAll();

            // Закрываем подключение к ДБ (PrismaClient)
            await this._db.$disconnect();
        } catch(e) {
            console.error(colors.red(`[Users] ${e.stack}`));
        }
    }

    /**
     * Перегрузка перечисления (итерирование) класса Users
     * 
     * @generator
     * @this Users
     * @returns {any}
     */
    *[Symbol.iterator]() {
        for (const item of this._data)
            yield item;
    }

    /**
     * Размер (кол-во юзеров)
     * 
     * @getter
     * @public
     * @readonly
     * @this Users
     * @returns {Number}
     */
    get size() {
        return this._data.size;
    }

    /**
     * Инициализируем юзера
     * 
     * @public
     * @this Users
     * @returns {Object}
     */
    init() {
        try {
            // Сначала пытаемся узнать, поднят ли текущий юзер в памяти

            this.get()
            const user = new User();
            const sid = user.generateSessionId();


        } catch(e) {

        }
    }



    /**
     * Регистрация пользователя
     * 
     * @async
     * @public
     * @param {String} email
     * @param {String} password
     * @this Users
     * @returns {any}
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

        // Создаем объект User
        const user = new User(userDb);

        // Генерируем идентификатор игровой сессии
        const sessionId = user.generateSessionId();

    }

    /**
     * Сохранение всех юзеров
     * 
     * @async
     * @public
     * @this Users
     * @returns {Promise<void>}
     */
    async saveAll() {
        const tasks = [];

        for (const user of this._data)
            tasks.push(user.save());

        await Promise.all(tasks);
    }

    /**
     * Получение игрока по фильтру. Метод возвращает первое вхождение по фильтру
     * 
     * @public
     * @param {Object} filter
     * @this Users
     * @returns {User|null}
     */
    getBy(filter) {
        // Перечисляем каждого игрока в памяти
        for (const item of this) {
            let flag = true; // Предполагаем, что item подходит

            // TODO: можно проверять вложенные объекты с проверкой рекурсии
            // Проверяем все параметры фильтра
            for (const [key, value] of Object.entries(filter)) {
                if (typeof(item[key]) !== typeof(value) || item[key] !== value) {
                    flag = false;
                    break;
                }
            }

            if (flag)
                return item;
        }

        return null;
    }
}

// Импортируем необходимые методы для работы с Map
for (const name of METHODS) {
    Users.prototype[name] = function(...args) {
        return this._data[name](...args);
    }
}

const users = new Users();

export default users;