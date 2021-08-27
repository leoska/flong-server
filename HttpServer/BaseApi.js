import { timeout } from '../utils';

const API_TIMEOUT = 20000;

export default class BaseApi {
    /**
     * Статическая функция на то, что класс является API-методом
     * 
     * @return {boolean}
     */
    static isApi() {
        return true;
    }

    /**
     * Базовый конструктор класса
     * 
     * @public
     * @constructor
     * @this BaseApi
     */
    constructor() {
        this.params = {};
    }
    
    /**
     * Установка объекта params
     * 
     * @public
     * @param {Object} params
     * @this BaseApi
     * @returns {void}
     */
    setParams(params) {
        this.params = params;
    }
    
    /**
     * Виртуальное тело метода
     * 
     * @public
     * @virtual
     * @param {any} [data]
     * @returns {any}
     */
    async process(data) {
        throw new Error(`Try to call virtual method.`);
    }
    
    /**
     * Метод вызова обработки API-метода
     * 
     * @async
     * @public
     * @this BaseApi
     * @returns {Promise<Object>}
     */
    async callProcess() {
        try {
            return {
                response: await Promise.race([timeout(API_TIMEOUT), this.process(this.params || {})])
            };
        } catch(e) {
            return {
                error: e.toString()
            };
        }
    }
}
