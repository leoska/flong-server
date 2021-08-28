export default class ErrorApiMethod extends Error {
    constructor(message, code, status, stack = false) {
        super('');
        this.code = code;
        this.status = status;
        this.message = message;
        
        if (stack)
            Error.captureStackTrace(this, this.constructor);
        else 
            this.stack = null;
    }
}
