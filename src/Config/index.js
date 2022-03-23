import _ from "lodash";

const defaultSettings = {
    protocol: "ws",
    platform: "html5"
};

class Config {
    _config = null;

    constructor() {
        this._config = Object.assign({}, defaultSettings);
    }

    /**
     * Инициализация настроек (конфига) сервера
     * 
     * @param {String} [env] 
     * @returns {void}
     */
    init(env = 'develop') {
        
        try {
            const conf = require(`@settings/${env}.json`);
            this._config = Object.assign({}, defaultSettings, conf);
        } catch(e) {

        }
        


    }

    /**
     * 
     * @param {String} path 
     * @returns {any}
     */
    get(path) {
        if (!this._config)
            throw new Error(`[Config] config is not initialized.`);

        return _.get(this._config, path, undefined);
    }
}

const config = new Config();

export default config;