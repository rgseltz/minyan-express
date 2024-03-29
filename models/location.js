const db = require('../db');
const expressError = require('../expressError');
const sqlPartialUpdate = require('../helpers/sql')

class Location {
    /** Get all locations from db - with an option to filter based on params (or requst body? - which is easier?*/

    static async findAll(searchParams = {}) {
        let query =
            `SELECT
                id, 
                nick_name AS "handle", 
                street_name AS "streetName", 
                street_number AS "streetNum", 
                city, 
                zip, 
                type 
            FROM locations`;
        let queryValues = [];
        let whereExpressions = [];
        const { handle, streetName, city, zip, isPublic, type } = searchParams;
        if (handle) {
            queryValues.push(`%${handle}%`);
            whereExpressions.push(`nick_name ILIKE $${queryValues.length}`);
        }
        if (streetName) {
            queryValues.push(`%${streetName}%`);
            whereExpressions.push(`streetName ILIKE $${queryValues.length}`);
        }
        if (city) {
            queryValues.push(`%$city%`);
            whereExpressions.push(`city ILIKE $${queryValues.length}`);
        }
        if (zip) {
            queryValues.push(zip);
            whereExpressions.push(`zip = $${queryValues.length}`);
        }
        if (isPublic) {
            queryValues.push(isPublic);
            whereExpressions.push(`is_public = $${queryValues.length}`);
        }
        if (type) {
            queryValues.push(`%${type}%`);
            whereExpressions.push(`type ILIKE $${queryValues.length}`);
        }
        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ")
        }
        console.log(queryValues);
        console.log(whereExpressions)
        console.log(query);
        const locations = await db.query(query, queryValues);
        return locations.rows;
    }

    /**Get location with specific ID that returns information about location
     *      returns {id, streetName, streetNum, handle, zip, isPublic, type}
     */
    static async get(id) {
        //check that ID actually exists//
        const result = await db.query(
            `SELECT id, nick_name FROM locations WHERE id = $1`, [id]
        );
        const location = result.rows[0];
        if (!location) return new expressError('Location does not exist', 404);
        return location;
    }
}

module.exports = Location;