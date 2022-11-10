const db = require('../db');
const expressError = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');
// const sqlPartialUpdate = require('../helpers/sqlPartialUpdate')

/* User model interacts with database to create/view/update/delete information on the users table**/

class User {
    /* Registers new users 
        RETURNS {username, password, firstName, lastName, email, isAdmin}**/
    static async register({ username, password, firstName, lastName, email, isAdmin }) {
        const duplicateCheck = await db.query(
            `SELECT username FROM users WHERE username = $1`, [username]
        );
        if (duplicateCheck.rows[0]) {
            throw new expressError('Username already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const results = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, is_admin) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING username, password, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`, [username, hashedPassword, firstName, lastName, email, isAdmin]
        );
        console.log(results.rows[0]);
        return results.rows[0];
    }

    static async authenticate({ username, password }) {
        /*check if username exists and throw password if no user, if user exists, compare password with hashed bcrypt password and return user-- first deleting password from user property (so it will NOT be included in body of jwtoken)**/
        const results = await db.query(
            `SELECT id, username, password FROM users WHERE username = $1`, [username]
        );
        const user = results.rows[0];
        if (!user) throw new expressError('user does not exist', 400);
        const isValid = bcrypt.compare(password, user.password);
        if (isValid) {
            delete user.password;
            return user;
        }
        return new expressError('Invalid username/password', 401);
    }

    static async get(username) {
        const result = await db.query(
            `SELECT * FROM users WHERE username = $1`, [username]
        );
        return result.rows[0];
    }

    static async findAll() {
        const results = await db.query(
            `SELECT id, username,
                 first_name AS "firstName", 
                 last_name AS "lastName", 
                 email, 
                 is_admin AS "isAdmin"
             FROM users
             ORDER BY username`
        );
        return results.rows;
    }
}

module.exports = User;