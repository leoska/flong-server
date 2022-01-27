import { User } from "./User";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import colors from 'colors';

const METHODS = [
    'set',
    'get',
    'has',
];

// Все латинские буквы (большие и маленькие) + некоторые специальные символы и цифры (общая длина от 6 до 20 знаков)
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
     * @this Users
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