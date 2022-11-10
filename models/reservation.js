const db = require('../db');
const Event = require('./event');
const expressError = require('../expressError');

/** Functions for creating and inserting reservation data into reservations table in db */

class Reservation {
    static async new(userId, eventId) {
        //Prevalidate collisions bet existing and new reservations with same user and event(incorporates location and time)//
        // const event = await Event.find(eventId);
        const checkDupes = await db.query(
            `SELECT user_id, event_id FROM reservations WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );//make an event object and using time properties (ie event.startTime), validate for collisions
        // const checkDupes = await db.query(
        //     `SELECT r.user_id, r.event_id, e.start_time, e.end_time FROM reservations AS r LEFT JOIN events AS e ON r.event_id = e.id WHERE r.user_id = $1 AND r.event_id = $2 AND e.start_time = $3 AND e.end_time = $4`,
        //     [userId, eventId, event.startTime, event.endTime]
        // );
        console.log('check dupes', checkDupes.rows[0]);
        if (checkDupes.rows[0]) throw new expressError('User reservation already exists!', 400);
        /** updates reservation in db*/
        await db.query(
            `INSERT INTO reservations (user_id, event_id) VALUES ($1, $2) RETURNING *`, [userId, eventId]
        );
        /** return reservation json with user info*/
        const returnRes = await db.query(
            `SELECT u.id AS "userId", u.username, r.event_id FROM reservations AS r LEFT JOIN users AS u ON u.id = r.user_id WHERE event_id = $1`, [eventId]
        );
        const newReservation = returnRes.rows[0];
        return newReservation;
    }
}

module.exports = Reservation;