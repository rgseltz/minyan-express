const db = require('../db');
const expressError = require('../expressError');
const sqlPartialUpdate = require('../helpers/sql')

/**Related functions for events */

class Event {
    /**  Creates a new event
     *  accepts data {start time and end time} and    
     */
    static async create(data, locationId) {
        let { startTime, endTime, currentCapacity } = data;
        currentCapacity++;
        const checkLocation = await db.query(
            `SELECT id, nick_name FROM locations WHERE id = $1`, [locationId]
        );
        if (!checkLocation.rows[0]) throw new expressError('Invalid location', 404);
        console.log(currentCapacity);
        console.log(locationId);
        const newEvent = await db.query(
            `INSERT INTO events (start_time, end_time, location_id, current_capacity) 
             values ($1, $2, $3, $4)`, [startTime, endTime, locationId, currentCapacity]
        );
        console.log(newEvent.rows[0]);
        return newEvent.rows[0];
    }
}

module.exports = Event;