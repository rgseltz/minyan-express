const db = require('../db');
const expressError = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const bcrypt = require('bcrypt');
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
}

module.exports = User;