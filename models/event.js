const db = require('../db');
const expressError = require('../expressError');
const sqlPartialUpdate = require('../helpers/sql')
const Location = require('./location');

/**Related functions for events */

class Event {
    /**  Creates a new event
     *  accepts data {start time and end time} and    
     */
    static async create(data, locationId) {
        let { startTime, endTime, serviceType, currentCapacity } = data;
        currentCapacity++;
        const checkLocation = await db.query(
            `SELECT id, nick_name FROM locations WHERE id = $1`, [locationId]
        );
        if (!checkLocation.rows[0]) throw new expressError('Invalid location', 404);
        console.log(currentCapacity);
        console.log(locationId);

        //PROBLEM: Overlapping times - how do I convert times and ensure that no two events occur at the same location in same time block? answer: do a sql SELECT search - convert times to numbers? - make sure new event does not coincide with that location at that time.
        //attempting dummy prevalidation below:
        const checkTime = await db.query(
            `SELECT l.id, e.start_time, e.end_time FROM locations as l
                LEFT JOIN events as e ON l.id = e.location_id WHERE e.start_time = $1 AND e.end_time = $2 
                AND l.id = $3`,
            [startTime, endTime, locationId]
        );
        console.log('time conflict?', checkTime.rows[0]);
        if (!checkTime.rows[0]) {
            await db.query(
                `INSERT INTO events (start_time, end_time, service_type, location_id, current_capacity) 
             values ($1, $2, $3, $4, $5) RETURNING *`, [startTime, endTime, serviceType, locationId, currentCapacity]
            );
            const results = await db.query(
                `SELECT l.id, l.nick_name, start_time, end_time, service_type, current_capacity
                FROM locations AS l LEFT JOIN events ON l.id = location_id WHERE location_id = $1`,
                [locationId]
            );
            const event = results.rows[0];
            return event;
        } else {
            throw new expressError('This service conflicts with an existing service at this location', 401);
        }
    }

    static async find(eventId) {
        /**Returns information about a single specific event located by eventId
         *   RETURNS {locationId, locationHandle, streetNum, streetName, city, zip, isPublic, locationType,
         * serviceType, startTime, endTime}
         */
        //validate that event exists first
        const checkEvent = await db.query(
            `SELECT id FROM events WHERE id = $1`, [eventId]
        );
        if (checkEvent.rows[0] !== undefined) {
            const result = await db.query(
                `SELECT 
                    l.id AS "locationId",
                    l.nick_name AS "locationHandle",
                    l.street_number AS "streetNum",
                    l.street_name AS "streetName",
                    l.city,
                    l.zip, 
                    l.is_public AS "isPublic",
                    l.type AS "locationType",
                    e.service_type AS "serviceType", 
                    e.start_time AS "startTime", 
                    e.end_time AS "endTime",
                    e.current_capacity AS "currentCapacity",
                    e.id AS "eventId" 
                FROM locations AS l LEFT JOIN events AS e ON l.id = e.location_id
                WHERE e.id = $1`, [eventId]
            );
            const event = result.rows[0];
            console.log(event);
            return event;
        } else {
            throw new expressError('Event does not exist', 401);
        }
    }

    static async findAll(searchParams = {}) {
        let query =
            `SELECT 
            l.id AS "locationId",
            l.nick_name AS "locationHandle",
            l.street_number AS "streetNum",
            l.street_name AS "streetName",
            l.city,
            l.zip, 
            l.is_public AS "isPublic",
            l.type AS "locationType",
            e.service_type AS "serviceType", 
            e.start_time AS "startTime", 
            e.end_time AS "endTime",
            e.id AS "eventId",
            e.current_capacity AS currentCapacity 
        FROM locations AS l LEFT JOIN events AS e ON l.id = e.location_id`;
        let whereExpressions = ['e.id > 0'];
        let queryValues = [];
        const { locationHandle, streetNum, streetName, city, zip, isPublic, locationType, serviceType, startTime, endTime } = searchParams;
        if (locationHandle) {
            queryValues.push(`%${locationHandle}%`);
            whereExpressions.push(`nick_name ILIKE $${queryValues.length}`);
        }
        if (streetNum) {
            queryValues.push(`%${streetNum}%`);
            whereExpressions.push(`street_number ILIKE $${queryValues.length}`);
        }
        if (streetName) {
            queryValues.push(`%${streetName}%`);
            whereExpressions.push(`street_name ILIKE $${queryValues.length}`);
        }
        if (city) {
            queryValues.push(`%${city}%`);
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
        if (locationType) {
            queryValues.push(`%${locationType}%`);
            whereExpressions.push(`type ILIKE $${queryValues.length}`);
        }
        if (serviceType) {
            queryValues.push(`%${serviceType}%`);
            whereExpressions.push(`service_type ILIKE $${queryValues.length}`);
        }
        if (startTime) {
            queryValues.push(`%${startTime}%`);
            whereExpressions.push(`start_time ILIKE $${queryValues.length}`);
        }
        if (endTime) {
            queryValues.push(`%${endTime}%`);
            whereExpressions.push(`end_time ILIKE $${queryValues.length}`);
        }
        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ")
        }
        const results = await db.query(query, queryValues);
        return results.rows;
    }
    static async join(eventId) {
        const event = await Event.find(eventId);
        // const currentCapacity = this.currentCapacity++;
        event.currentCapacity++
        const updateEvent = await db.query(
            `UPDATE events SET current_capacity = $1 WHERE id = $2 RETURNING *`,
            [event.currentCapacity, eventId]
        );
        return updateEvent.rows[0];
    }
}

module.exports = Event;