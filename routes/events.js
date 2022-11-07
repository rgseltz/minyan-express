const express = require('express');
const { ensureUserLoggedIn } = require('../middleware/auth');
const expressError = require('../expressError');
const jsonschema = require('jsonschema');
const newEventSchema = require('../json_schemas/eventNew.json');
// const updateEventSchema = require('../json_schemas/eventUpdate.json');
// const eventSearchSchema = require('../json_schemas/eventSearch.json');
const Event = require('../models/event');
const router = new express.Router();

/* validate that event data was inputed into req.body correctly using json schema, then insert event into db via event.js model 
**/

/** POST /events/new/:locationId {event} => {event} 
 * event should contain {startTime, endTime, date, location}
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
        // const reservation = await Reservation.add(userId, eventId);
        const { eventId, locationId } = event;
        console.log(res.locals);
        return res.status(201).json({ data: { event } });
    } catch (err) {
        return next(err)
    }
})

module.exports = router;