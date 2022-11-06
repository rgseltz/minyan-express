const express = require('express');
const expressError = require('../expressError');
const router = new express.Router();
const Location = require('../models/location');
const jsonschema = require('jsonschema');
const locationSearchSchema = require('../json_schemas/locationSearch.json');

/**GET /locations with optional search parameters {handle, streetName, streetNum, city, zip, isPublic, type}
*/
router.get('/', async (req, res, next) => {
    try {
        const q = req.query;
        //req query params come in as string but need converted to int/boolean//
        // if (q.streetNum) +q.streetNum; sql schema has data type as varChar - so may not need to conver?
        if (q.zip) +q.zip;
        q.isPublic = q.isPublic === true;

        const validator = jsonschema.validate(q, locationSearchSchema);
        if (!validator) {
            let errorsList = validator.errors.map(e => e.stack);
            throw new expressError(errorsList, 400);
        }
        const locations = await Location.findAll(q);
        console.log(locations);
        return res.json({ locations });
    } catch (err) {
        return next(err);
    }
})

/** GET /[locationID] => {location}
 * returns {id, handle, streetName, streetNum, city, zip, isPublic, type}
 */
router.get('/:id', async (req, res, next) => {
    try {
        const location = await Location.get(req.params.id);
        return res.json({ location });
    } catch (err) {
        next(err);
    }
})

module.exports = router;