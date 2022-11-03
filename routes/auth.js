const express = require('express');
const expressError = require('../expressError');
const { createToken } = require('../helpers/tokens');
const router = new express.Router();

/* POST: auth/register 
    creates user token to be used to authenticate further user requests 
    req.body must include {username, firstName, lastName, password, email}**/



module.exports = router;
