const express = require('express');
const expressError = require('../expressError');
const jsonschema = require('jsonschema'); //for validation of data to api
const { createToken } = require('../helpers/tokens'); //to create token once validated
const userRegisterSchema = require('../json_schemas/userRegister.json');
const userAuthSchema = require('../json_schemas/userAuth');
const User = require('../models/user');
const router = new express.Router();

/* POST: auth/register 
    RETURNS a new user token to be used to authenticate further user requests 
    req.body must include {username, firstName, lastName, password, email}**/

router.post('/register', async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            let errorList = validator.errors.map(e => e.stack);
            throw new expressError(errorList, 400);
        };
        console.log('valid data schema');

        const newUser = await User.register({ ...req.body, isAdmin: false });
        const token = createToken(newUser);
        console.log(token);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
})

/* POST auth/token 
    validates user token and RETURNS token to authenticate future requests and stored on front end react app.
    req.body must include {username, password} returns {token}**/
router.post('/token', async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            let errorList = validator.errors.map(e => e.stack);
            throw new expressError(errorList, 400);
        }

        const user = await User.authenticate({ ...req.body });
        const token = createToken(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;
