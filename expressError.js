/** custom error class that prints specific error message and status code b/c generic Error class is too vague*/

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = ExpressError;