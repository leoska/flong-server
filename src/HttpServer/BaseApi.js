import { timeout } from '../utils';
import colors from 'colors';

const API_TIMEOUT = 20000;

export default class BaseApi {
    _params = null;
    _headers = null;

    /**
     * Статическая функция на то, что класс является API-методом
     * 
     * @return {Boolean}
     */
    static isApi() {
        return true;
    }

    /**
     * Сеттер для параметров
     * 
     * @setter
     * @public
     * @param {Object} params
     * @this BaseApi
     */
    set params(params) {
        this._params = params;
    }

    /**
     * Сеттер для заголовков
     * 
     * @setter
     * @public
     * @param {Object} headers
     * @this BaseApi
     */
    set headers(headers) {
        this._headers = headers;
    }

    /**
     * Базовый конструктор класса
     * 
     * @public
     * @constructor
     * @this BaseApi
     */
    constructor() {
        this._params = null;
        this._headers = null;
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
        return {
            response: await Promise.race([timeout(API_TIMEOUT), this.process(this._params || {})]),
        };
    }
}
