/**
 * Функция обработкик таймаута для API-методов
 * 
 * @param ms
 * @returns {Promise<Error>}
 */
export function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Timeout reached')), ms);
    });
}

/**
 * Функция декоратор для определения правильного метода
 * 
 * @param name
 * @returns {(function(*, *, *): void)|*}
 */
export function method(name) {
    return function(target) {
        return class Api extends target {
            constructor(method) {
                // Обработка Method Not Allowed (405)
                if (method !== name)
                    throw new ErrorApiMethod(`Incorrect HTTP-method!`, "Method Not Allowed", 405);
                super();
            }
        }
    }
}
