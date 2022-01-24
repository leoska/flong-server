export default class UserData extends Map {

    /**
     * Базовый конструктор
     * 
     * @param {*} data 
     */
    constructor(data) {
        super();

        for (const [key, value] of Object.entries(data)) {
            this.set(key, value);
        }
    }

    /**
     * Преобразование в объект
     * 
     * @public
     * @returns {Object}
     */
    toJSON() {
        return Object.fromEntries(this);
    }
}