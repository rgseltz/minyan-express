const db = require('../db');
const expressError = require('../expressError');
const sqlPartialUpdate = require('../helpers/sql')

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
        const newEvent = await db.query(
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
    }
}

module.exports = Event;