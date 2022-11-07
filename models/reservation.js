const db = require('../db');
const expressError = require('../expressError');

/** Functions for creating and inserting reservation data into reservations table in db */

class Reservation {
    static async new(userId, eventId) {
        const checkDupes = await db.query(
            `SELECT user_id, event_id FROM reservations WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );
        console.log(checkDupes.rows[0]);
        if (checkDupes.rows[0]) throw new expressError('User reservation already exists!', 400);

        const result = await db.query(
            `INSERT INTO reservations (user_id, event_id) VALUES ($1, $2) RETURNING *`, [userId, eventId]
        );
        const newReservation = result.rows[0];
        return newReservation;
    }
}

module.exports = { Reservation };