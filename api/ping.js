import BaseApi       from '../BaseApi';
import { method }    from '../utils';

@method("GET")
export default class Ping extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Дебаговый API-метод для проверки работы сервиса
     *
     * @override
     * @this Ping
     * @returns {Promise<boolean>}
     */
    async process({}) {
        return true;
    }

}

