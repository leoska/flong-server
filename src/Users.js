import { User } from "./User";
import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const METHODS = [
    'set',
    'get',
    'has',
];

/**
 * Сигнлтоновский класс, Map юзеров на сервере
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
            _tokenStore: { value: new WeakMap(), enumerable: false, configurable: false, writable: false },
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
     * @returns {Promise<any>}
     */
    async register(email, password) {
    }

    /**
     * Авторизация пользователя
     * 
     * @async
     * @public
     * @param {String} email
     * @param {String} password
     * @this Users
     * @returns {Promise<any>}
     */
    async authorize(email, password) {
    }

    /**
     * Сохранение и выгрузка юзера из памяти
     * 
     * @param {Number} userId 
     */
    async unload(userId) {

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

        // TODO: при большой кол-ве юзеров можно увеличить кол-во открытых коннектов к ДБ
        for (const [id, user] of this._data) {
            const task = user.save(this._db).then(() => {
                console.info(colors.green(`[Users] User with id [${id}] has successfully saved.`));
            }, (err) => {
                console.error(colors.red(`[Users] User not saved: ${err.stack}`));
            });

            tasks.push(task);
            console.warn(colors.bgCyan(`[Users] User with id [${id}] trying to save.`));
        }

        await Promise.allSettled(tasks);
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