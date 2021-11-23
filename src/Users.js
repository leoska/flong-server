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
        try {
            // Сначала пытаемся узнать, поднят ли текущий юзер в памяти
            this.get()
            const user = new User();
            const sid = user.generateSessionId();


        } catch(e) {

        }
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