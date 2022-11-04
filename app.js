const express = require('express');
const db = require('./db');
const expressError = require('./expressError')
const app = express();

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const eventsRouter = require('./routes/events');
const ExpressError = require('./expressError');

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/locations', locationRoutes);
app.use('/events', eventsRouter)

/* 404 handler after passing all routes without returning **/
app.use((req, res, next) => {
    const err = new ExpressError('Not Found', 404);
    return next(err);
})


//generic error handler
app.use((err, req, res, next) => {
    const message = err.message;
    const status = err.status || 500;
    return res.status(status).json({
        message,
        status
    })
})


module.exports = app;
