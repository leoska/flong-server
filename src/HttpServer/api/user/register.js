import BaseApi       from '../../BaseApi';
import { method }    from '../../../utils';
import users         from '../../../Users';

/**
 * 
 */

@method("POST")
export default class Register extends BaseApi {
    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Register
     */
    constructor() {
        super();
    }

    /**
     * Метод для регистрации юзера (логин и пароль)
     *
     * @override
     * @param {String} payload - логин и пароль в base64
     * @this Register
     * @returns {Promise<boolean>}
     */
    async process({payload}) {
        const usernameAndPass = Buffer.from(payload, 'base64').toString();
        const [username, password] = usernameAndPass.split("|");

        try {
            await users.register(username, password);
        } catch(e) {
            console.error(e);
        }

        console.log([login, password]);

        const userId = "test";
        users.set(userId, {user: 123});
        const sid = users.init();
        return {
            user: users.get(userId),
            sid
        };
    }

}

