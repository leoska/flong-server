import BaseApi       from '../BaseApi';
import { authUser, method }    from '../../utils';
import users         from '../../Users';

@method("GET")
@authUser
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
     * @param {String} version - 
     * @this Ping
     * @returns {Promise<boolean>}
     */
    async process({version}) {
        // const data = Buffer.from(cookie, "hex");
        
        console.log(this._headers);

        const userId = "test";
        users.set(userId, {user: 123});
        const sid = users.init();
        return {
            user: users.get(userId),
            sid
        };
    }

}

