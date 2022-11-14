const db = require('../db');
const expressError = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql')

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

    /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            });
        //Adjust index to account for user.id
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }

    static async remove(username) {
        let result = await db.query(
            `DELETE FROM users WHERE username = $1`, [username]
        );

        if (!result.rows[0]) throw new expressError(`User ${username} not found`, 401);
    }
}

module.exports = User;