import BaseApi       from '../../BaseApi';
import { method }    from '@modules/utils';
import users         from '@modules/Users';

/**
 * Метод для авторизации пользователя
 * 
 * Возвращает JWT с необходимой мета информацией
 */

@method("POST")
export default class UserAuth extends BaseApi {
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
     * @param {String} payload - почта и пароль в base64
     * @this Auth
     * @returns {Promise<boolean>}
     */
    async process({}, {payload}) {
        if (payload === undefined)
            throw new ErrorApiMethod(`Parameter "payload" is missing`, "PARAMETER_IS_MISSING", 400);

        const usernameAndPass = Buffer.from(payload, 'base64').toString();
        const [email, password] = usernameAndPass.split("|");

        try {
            return await users.authorize(email, password);
        } catch(e) {
            throw e;
        }
    }

}

