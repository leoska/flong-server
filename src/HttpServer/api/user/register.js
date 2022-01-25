import BaseApi       from '../../BaseApi';
import { method }    from '../../../utils';
import users         from '../../../Users';

/**
 * Метод для регистрации пользователя
 * 
 * Возвращает JWT с необходимой мета информацией
 */

@method("POST")
export default class UserRegister extends BaseApi {
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
    async process({}, {payload}) {
        if (payload === undefined)
            throw new ErrorApiMethod(`Parameter "payload" is missing`, "PARAMETER_IS_MISSING", 400);

        const usernameAndPass = Buffer.from(payload, 'base64').toString();
        const [email, password] = usernameAndPass.split("|");

        try {
            return await users.register(email, password);
        } catch(e) {
            throw e;
        }
    }

}

