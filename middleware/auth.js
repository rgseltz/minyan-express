/**Middleware to ensure authorization of users for specific route http requests */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const expressError = require('../expressError');

/**Check if token was provided, validate and if valid, add username, and userID to res.locals.user 
 * this will be used for sql queries requiring user info as well as login authentication.
 * Do not throw error if no token provided.. error will be thrown in following auth middelware functions
*/

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next()
    } catch (err) {
        return next()
    }
}

function ensureUserLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new expressError("User must be logged in to complete request", 401);
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = { authenticateJWT, ensureUserLoggedIn }



