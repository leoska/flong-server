import User from "./User";

const METHODS = [
    'set',
    'get',
    'has',
];

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
            _data: { value: new Map(), enumerable: false, configurable: false, writable: false }
        });
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
        const user = new User();
        const sid = user.generateSessionId();
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
}

// Импортируем необходимые методы для работы с Map
for (const name of METHODS) {
    Users.prototype[name] = function(...args) {
        return this._data[name](...args);
    }
}

const users = new Users();

export default users;