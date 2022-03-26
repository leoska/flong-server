import ErrorApiMethod from '@modules/ErrorApiMethod';
import Users from '../Users';

/**
 * Функция обработкик таймаута для API-методов
 * 
 * @param {Number} ms
 * @param {Boolean} [safe]
 * @returns {Promise<Error>}
 */
export function timeout(ms, safe = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => safe ? resolve() : reject(new Error('Timeout reached')), ms);
    });
}

/**
 * Декоратор для определения правильного API метода
 * 
 * @param {String} name
 * @returns {(function(*, *, *): void)|*}
 */
export function method(name) {
    return function(target) {
        return class Api extends target {
            constructor(method) {
                // Обработка Method Not Allowed (405)
                if (method !== name)
                    throw new ErrorApiMethod(`Incorrect HTTP-method! Api-method [${target.name}] has a [${name}] method. Try to call another [${method}] method.`, "Method Not Allowed", 405);
                super();
            }

            // Переопределяем имя класса
            static get name() {
                return super.name;
            }
        }
    }
}

/**
 * Декоратор для логирования
 */
export function log() {

}

/**
 * Декоратор для предоставления доступа в апи к юзеру (кто дёрнул апи)
 * 
 * @param {*} target 
 * @returns 
 */
export function authUser(target) {
    target.prototype = {
        __proto__: target.prototype,
        ...target.prototype,
        get user() {
            return new Promise(async (resolve, reject) => {
                resolve(await Users.get());
            });
        }
    }

    return target;
}


