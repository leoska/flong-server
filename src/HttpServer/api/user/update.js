import BaseApi       from '../../BaseApi';
import { method }    from '@modules/utils';
import users         from '@modules/Users';

@method("PUT")
export default class UserUpdate extends BaseApi {
    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Auth
     */
    constructor() {
        super();
    }

    /**
     * Метод для авторизации юзера
     *
     * @override
     * @param {String} version - версия приложения
     * @param {String} platform - платформа приложения
     * @this Auth
     * @returns {Promise<boolean>}
     */
    async process({}, {}) {
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

