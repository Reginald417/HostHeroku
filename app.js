const express = require('express'); // DO NOT DELETE
const cors = require('cors');
const morgan = require('morgan');
const app = express(); // DO NOT DELETE

const database = require('./database');

app.use(morgan('dev'));
app.use(cors());

/**
 * =====================================================================
 * ========================== CODE STARTS HERE =========================
 * =====================================================================
 */

/**
 * ========================== SETUP APP =========================
 */
app.use(express.json())

const error = {
    QUEUE_EXIST: {
        body: {error: 'Queue alreay exists',code: 'QUEUE_EXISTS'},
        status: 422,
    },
}

/**
 * JSON Body
 */

/**
 * ========================== RESET API =========================
 */

/**
 * Reset API
 */

/**
 * ========================== COMPANY =========================
 */

/**
 * Company: Create Queue
 */

app.post('/company/queue', function (req, res) {

    const queue_id = req.body.queue_id;
    const company_id = req.body.company_id; 

    database.createQueue(queue_id, company_id, function (err, result) {
        if (!err) {
            console.log(result + " row inserted.");
            res.status(201).send("Created")
        } else{
            res.send(err.statusCode);
        }
    });
    
});


/**
 * Company: Update Queue
 */

app.put('/company/queue', function (req, res) {
    
    const queue_id = req.query.queue_id;   
    const status = req.body.status;
    
    database.updateQueue(queue_id, status, function (err, result) {
        if (!err) {
            console.log(result+" row updated.");
            res.send(result + ' record inserted');
        } else{
            res.send(err.statusCode);
        }
    });
});

/**
 * Company: Server Available
 */

/**
 * Company: Arrival Rate
 */

/**
 * ========================== CUSTOMER =========================
 */

/**
 * Customer: Join Queue
 */

/**
 * Customer: Check Queue
 */

/**
 * ========================== UTILS =========================
 */

/**
 * 404
 */

app.use(function (req, res, next) {
    throw {
        body: {error: 'Not Found!'},
        status: 404,
    };
});

/**
 * Error Handler
 */

app.use(function (err, req, res, next) {
    const status = err.status || 500;
    const body = err || {
        error: 'Unexpected Error!',
    };
    res.status(status).send(body);
});

function tearDown() {
    // DO NOT DELETE
    return database.closeDatabaseConnections();
}

/**
 *  NOTE! DO NOT RUN THE APP IN THIS FILE.
 *
 *  Create a new file (e.g. server.js) which imports app from this file and run it in server.js
 */

module.exports = { app, tearDown }; // DO NOT DELETE
