import BaseApi       from '../BaseApi';
import { method }    from '../../utils';
import users         from '../../Users';

@method("GET")
export default class Init extends BaseApi {
    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Ping
     */
    constructor() {
        super();
    }

    /**
     * Метод для поднятия юзера в памяти
     *
     * @override
     * @param {String} cookie - в формате base64
     * @this Ping
     * @returns {Promise<boolean>}
     */
    async process({cookie}) {
        const data = Buffer.from(cookie, "utf-8");
        

        const userId = "test";
        users.set(userId, {user: 123});
        const sid = users.init();
        return {
            user: users.get(userId),
            sid
        };
    }

}

