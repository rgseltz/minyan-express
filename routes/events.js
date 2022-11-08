const express = require('express');
const { ensureUserLoggedIn } = require('../middleware/auth');
const expressError = require('../expressError');
const jsonschema = require('jsonschema');
const newEventSchema = require('../json_schemas/eventNew.json');
// const updateEventSchema = require('../json_schemas/eventUpdate.json');
const eventSearchSchema = require('../json_schemas/eventSearch.json');
const Event = require('../models/event');
const Reservation = require('../models/reservation');
// const Location = require('../models/location');
const router = new express.Router();

/* validate that event data was inputed into req.body correctly using json schema, then insert event into db via event.js model 
**/

/** POST /events/new/:locationId {event} => {event} 
 * event should contain {startTime, endTime, date, locationId}
 * should return {startTime, endTime, date, location-handle}
*/
router.post('/new/:locationId', ensureUserLoggedIn, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newEventSchema);
        if (!validator) {
            let errorList = validator.errors.map(e => e.stack);
            throw new expressError(errorList, 400);
        }
        req.body.currentCapacity = +req.body.currentCapacity;
        req.params.locationId = +req.params.locationId;
        const event = await Event.create(req.body, req.params.locationId);
        if (!event) return;
        console.log('res.locals', res.locals);
        const { userId } = res.locals.user
        const reservation = await Reservation.new(userId, event.id);
        return res.status(201).json({ data: { event, reservation } });
    } catch (err) {
        return next(err)
    }
})


/**GET /events/:eventId */
router.get('/:eventId', ensureUserLoggedIn, async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const event = await Event.find(eventId);
        return res.json({ event });
    } catch (err) {
        next(err);
    }
})


/** GET /events should return all events with an option to search filter params based on 
 *   {locationHandle, streetName, streetNum, zip, city, is_public, locationType(park, hotel), serviceType(morning,    afternoon), startTime, endTime, (duration??)
 * RETURNS events with {locationHandle, streetNum, streetName, city, locationType, serviceType, startTime, endTime, currentCapacity}}
*/
router.get(`/`, ensureUserLoggedIn, async (req, res, next) => {
    try {
        let q = req.query;
        if (q.zip) +q.zip;
        q.isPublic = q.isPublic === true;
        const validator = jsonschema.validate(q, eventSearchSchema);
        if (!validator) {
            let errorsList = validator.errors.map(e => e.stack);
            throw new expressError(errorsList, 400);
        }
        const events = await Event.findAll(q);
        return res.json({ events });
    } catch (err) {
        return next(err);
    }
})

/** PATCH /events/join/:eventId
 *   Update event to increment ++currentUser 
 *   Add new reservation for userId to eventId   
 */
router.patch('/join/:eventId', ensureUserLoggedIn, async (req, res, next) => {
    try {
        console.log(res.locals.user);
        const { userId } = res.locals.user;
        const { eventId } = req.params;
        const joinEvent = await Event.join(eventId);
        console.log('userId', userId);
        const newRes = await Reservation.new(userId, eventId)
        return res.status(200).json({ data: { joinEvent, newRes } });
    } catch (err) {
        return next(err);
    }
})




module.exports = router;