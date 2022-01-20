import BaseApi       from '../BaseApi';
import { method }    from '../../utils';
import ErrorApiMethod from '../../ErrorApiMethod';

// Поддерживаемые платформы
const PLATFORMS = [
    'html5',
];

// Поддерживаемые версии билдов
const VERSIONS = [
    '0.0.1',
]

@method("GET")
export default class Init extends BaseApi {
    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Init
     */
    constructor() {
        super();
    }

    /**
     * Метод для инициализация игры и отдачи первычных данных
     *
     * @override
     * @param {String} version - версия приложения
     * @param {String} platform - платформа приложения
     * @this Init
     * @returns {Promise<boolean>}
     */
    async process({version, platform}, {}) {
        if (version === undefined)
            throw new ErrorApiMethod(`Parameter "version" is missing`, "PARAMETER_IS_MISSING", 400);

        if (platform === undefined)
            throw new ErrorApiMethod(`Parameter "platform" is missing`, "PARAMETER_IS_MISSING", 400);

        if (!VERSIONS.includes(version))
            throw new ErrorApiMethod(`Client version [${version}] is not more supported`, "NOTSUPPORTED_CLIENT_VERSION", 500);

        if (!PLATFORMS.includes(platform))
            throw new ErrorApiMethod(`Platform [${platform}] is not more supported`, "NOTSUPPORTED_CLIENT_PLATFORM", 500);

        return {};
    }

}

