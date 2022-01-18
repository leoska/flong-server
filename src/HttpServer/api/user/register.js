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
     * @param {String} payload - почта и пароль в base64
     * @this Register
     * @returns {Promise<boolean>}
     */
    async process({payload}) {
        const usernameAndPass = Buffer.from(payload, 'base64').toString();
        const [email, password] = usernameAndPass.split("|");

        console.log([email, password]);

        try {
            await users.register(email, password);

            return {
                res: true
            };
        } catch(e) {
            console.error(e);
            throw e;
        }
    }

}

