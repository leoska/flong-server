import _ from "lodash";
import logger from './logger';

const defaultSettings = {
    protocol: "ws",
    platform: "html5"
};

const DEFAULT_CONFIG_ENV = 'develop';
const ARGV_CONFIG_ENV = process.argv[2] || '';

const env = DEFAULT_CONFIG_ENV || ARGV_CONFIG_ENV;

let configObj = Object.assign({}, defaultSettings);

try {
    const configFile = require(`${process.cwd()}/settings/${env}.json`);
    if (!configFile)
        throw new Error(`[Config] settings.json is undefined or null.`);

    if (!typeof(configFile) === 'object')
        throw new Error(`[Config] settings.json type is [${typeof(configFile)}] but expected object.`);

    configObj = Object.assign(configObj, configFile);
    logger.log(`[Config] settings.json successfully loaded.`);
} catch(e) {
    logger.error(`[Config] Something went wrong on loading config: ${e.stack}`);
}

Object.defineProperties(configObj, {
    get: {
        enumerable: false, 
        configurable: false, 
        writable: false,
        value: function(path) {
            return _.get(this, path, undefined);
        }
    }
});

export default function get(path) {
    return configObj.get(path);
};