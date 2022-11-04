const express = require('express');
const expressError = require('../expressError');
const jsonschema = require('jsonschema');
const newEventSchema = require('../json_schemas/eventNew.json');
const updateEventSchema = require('../json_schemas/eventUpdate.json');
const eventSearchSchema = require('../json_schemas/eventSearch.json')
const router = new express.Router();

/* validate that event data was inputed into req.body correctly using json schema, then insert event into db via event.js model 
**/

/** POST /events/new {event} => {event} 
 * event should contain {startTime, endTime, date, location}
 * should return {startTime, endTime, date, location-handle}
*/

module.exports = router;