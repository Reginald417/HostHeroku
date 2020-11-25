const express = require('express'); // DO NOT DELETE
const cors = require('cors');
const morgan = require('morgan');
const app = express(); // DO NOT DELETE
const database = require('./database');
const { Validator, ValidationError } = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const schema_createQueue = require('.//jsonSchemas/createQueue.json');
const schema_updateQueue = require('.//jsonSchemas/updateQueue.json');
const schema_updateQueueQuery = require('.//jsonSchemas/updateQueueQuery.json');
const schema_arrivalRate = require('.//jsonSchemas/arrivalRate.json');
const schema_joinQueue = require('.//jsonSchemas/joinQueue.json');
const schema_serverAvailable = require('.//jsonSchemas/serverAvailable.json');
const schema_checkQueue = require('.//jsonSchemas/checkQueue.json');
const { queue } = require('async');

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
app.use(express.json());


const errors = {
    INVALID_JSON_BODY: {
        message: 'Input is invalid',
        status: 400,
        code: 'INVALID_JSON_BODY',
    },
    INVALID_QUERY_STRING: {
        message: 'Query is invalid', 
        status: 400,
        code: 'INVALID_QUERY_STRING',
    }
};

/**
 * JSON Body
 */

/**
 * ========================== RESET API =========================
 */

/**
 * Reset API
 */

 
app.post('/reset',function (req, res, next) {

    database.resetTables()
        .then(function(result){
            res.status(200).send();
        })  
        .catch(function(error){
            next(error);
        });
});


/**
 * ========================== COMPANY =========================
 */

/**
 * Company: Create Queue
 */

app.post('/company/queue',validator.validate({body: schema_createQueue}) ,function (req, res, next) {
    
    const queue_id = req.body.queue_id;
    const company_id = req.body.company_id; 

    database.createQueue(queue_id, company_id)
        .then(function(result){
            res.status(201).send();
        })  
        .catch(function(error){
            next(error);
        });
});

/**
 * Company: Update Queue
 */
app.put('/company/queue',validator.validate({body: schema_updateQueue,query: schema_updateQueueQuery}),function (req, res, next) {

    const queue_id = req.query.queue_id;   
    const status = req.body.status;

    database.updateQueue(queue_id, status)
    .then(function(){
        res.status(200).send();
    })   
    .catch(function(error){
        next(error);
    });
});

/**
 * Company: Server Available
 */

app.put('/company/server',validator.validate({body: schema_serverAvailable}),function (req, res, next) {

    const queue_id = req.body.queue_id;   

    database.serverAvailable(queue_id)
    .then(function(result){
        res.status(200).send(result);
    })   
    .catch(function(error){
        next(error);
    });
});

/**
 * Company: Arrival Rate
 */

app.get('/company/arrival_rate',validator.validate({query: schema_arrivalRate}),function (req, res, next) {

    const queue_id = req.query.queue_id;
    const from = req.query.from;
    const duration = req.query.duration;   
    if(parseInt(duration)>=1 && parseInt(duration)<=1440){
        database.arrivalRate(queue_id, from, duration)
        .then(function(result){
            res.status(200).send(result);
        })   
        .catch(function(error){
            next(error);
        });
    }
    else {
        console.log('Invalid Query String');
        next(errors.INVALID_QUERY_STRING);
    }
});

/**
 * ========================== CUSTOMER =========================
 */

/**
 * Customer: Join Queue
 */

app.post('/customer/queue',validator.validate({body: schema_joinQueue}),function (req, res, next) {
    
    const customer_id = req.body.customer_id; 
    const queue_id = req.body.queue_id;

    database.joinQueue(customer_id, queue_id)
        .then(function(result){
            res.status(201).send();
        })  
        .catch(function(error){
            next(error);
        });
});

/**
 * Customer: Check Queue
 */

app.get('/customer/queue',validator.validate({query: schema_checkQueue}),function(req,res,next){
    
    const queue_id = req.query.queue_id;
    const customer_id = parseInt(req.query.customer_id);
    
    if ((customer_id>= 1000000000 && customer_id<= 9999999999) && isNaN(customer_id)){
        database.checkQueue(queue_id,customer_id)
            .then(function(result){
                res.status(200).send(result);
            })
            .catch(function(error){
                next(error);
            });
    }
    else {
        console.log('Invalid Query String');
        next(errors.INVALID_QUERY_STRING);
    }
})

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
    if (err instanceof ValidationError) {
        if (err.validationErrors.body != undefined){
            console.log('Invalid JSON Body');
            res.status(errors.INVALID_JSON_BODY.status).send(errors.INVALID_JSON_BODY);
        }
        else {
            console.log('Invalid Query String')
            res.status(errors.INVALID_QUERY_STRING.status).send(errors.INVALID_QUERY_STRING);
        }
    }
    else {
        const status = err.status || 500;
        const error = err || {
            error: 'Unexpected Error!',
        };
        res.status(status).send(error);
    }
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
