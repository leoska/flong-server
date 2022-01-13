import _ from "lodash";

class Config {
    _config = null;

    constructor() {
        
    }

    /**
     * Инициализация настроек (конфига) сервера
     * 
     * @param {String} [env] 
     */
    init(env = 'develop') {
        this._config = require(`./../../settings/${env}.json`);
    }

    get(path) {
        if (!this._config)
            throw new Error(`[Config] config is not initialized.`);

        return _.get(this._config, path, undefined);
    }
}

const config = new Config();

export default config;