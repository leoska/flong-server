export default class ErrorApiMethod extends Error {
    constructor(message, code, status, stack = false) {
        super(message);
        this.code = code;
        this.status = status;
        this._canViewStack = stack;
    }
    
    getStack() {
        return this._canViewStack ? this.stack : null;
    }
}
