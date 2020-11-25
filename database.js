
const { queue } = require('async');
const { Client } = require('pg')
var databaseConfig = {
    user: 'gbucvqwv',
    host: 'satao.db.elephantsql.com',
    database: 'gbucvqwv',
    password: 'cm7nKGmJc4HyswI2FR5zJhHWQWiJ5AVY',
    port: 5432,
  }


const errors = {
  QUEUE_EXIST: {
    message: 'Queue ID already exists',
    status: 422,
    code: 'QUEUE_EXISTS',
  },
  UNKNOWN_QUEUE: {
    message: 'Queue ID provided is non existent',
    status: 404,
    code: 'UNKNOWN_QUEUE',
  },
  INACTIVE_QUEUE: {
    message: 'Queue is inactive',
    status: 422,
    code: 'INACTIVE_QUEUE'
  },
  ALREADY_IN_QUEUE: {
    message: 'Customer is already in the queue',
    status: 422,
    code: 'ALREADY_IN_QUEUE'
  }

};

function checkQueueIdExist(queue_id) {
  const client = new Client(databaseConfig);
  client.connect();

  const sql = 'SELECT * FROM queue_table WHERE queue_id = lower($1)';

  return client.query(sql,[queue_id])
  .then(function(result){
    if(result.rowCount==0){
      client.end();
      console.log('Queue ID non-existent')
      throw errors.UNKNOWN_QUEUE;
    }
    client.end()
    return result;
  })
  .catch(function(error){
    client.end();
    throw error;
  })
};

function createQueue(queue_id,company_id) {
  const client = new Client(databaseConfig);
    client.connect();

    const sql = 'INSERT INTO queue_table VALUES (lower($1),$2);' 
    
    return client.query(sql,[queue_id,company_id])
      .then(function(result){
        console.log('Queue created successfully');
        client.end();
        return result;
        }
      )
      .catch(function(error){
        if(error.code == '23505') {
          console.log('Queue ID already exists')
          client.end();
          throw errors.QUEUE_EXIST;
        }      
        else{
          client.end();
          throw error
      }
    });
};

function updateQueue(queue_id,status) {
  const client = new Client(databaseConfig);
  client.connect();
  if(status=='ACTIVATE') {var updatingStatus = 'active';}
  else {var updatingStatus = 'inactive';};

  const sql = 'UPDATE queue_table SET status=$1 WHERE queue_id=lower($2);';

  return checkQueueIdExist(queue_id)
    .then(function(result){
      return client.query(sql,[updatingStatus,queue_id]);
    })
    .then(function(result){
        console.log("Queue updated sucessfully");
        client.end();
        return(result);
    })
    .catch(function(error){
      client.end();
      throw error;
    });
};

function arrivalRate(queue_id,from,duration) {
  const client = new Client(databaseConfig);
  client.connect(); 

  const sql = 'SELECT time, count(*) FROM record_table WHERE queue_id = lower($1) GROUP BY time ORDER BY time ASC';

  return checkQueueIdExist(queue_id)
  .then(function(result) {
    const fromTime = Date.parse(from)/1000;
    const endTime = fromTime + duration*60;
    return client.query(sql,[queue_id])
    .then(function(result){
      const resultRows = result.rows;
      const fittedRows = [];
      const finalResult = [];
      for (i=0;i<resultRows.length;i++){
        resultRows[i].time = Date.parse(resultRows[i].time)/1000
      };
      for (i=0;i<resultRows.length;i++){
        if (resultRows[i].time>=fromTime && resultRows[i].time<=endTime){
          fittedRows.push(resultRows[i]);
        };
      };
      for (i=0;i<duration*60;i++) {
        finalResult.push({'timestamp':fromTime+i,'count': '0'})
        for(x=0;x<fittedRows.length;x++) {
          if (finalResult[i].timestamp==fittedRows[x].time) {
            finalResult[i].count = fittedRows[x].count;
          };
        };
      };
      console.log('Arrival Rate Done')
      client.end();
      return(finalResult);
    })
  })
  .catch(function(error){
    client.end(); 
    throw error
  });
};


function joinQueue(customer_id,queue_id) {
  const client = new Client(databaseConfig);
  client.connect();

  const sql = 'INSERT INTO customer_table VALUES ($1,lower($2))';
  const sqlRecord = 'INSERT INTO record_table (queue_id) VALUES (lower($1))';

  return checkQueueIdExist(queue_id)
  .then(function(result){
    if(result.rows[0].status=='inactive'){
      throw errors.INACTIVE_QUEUE;
    }
    return client.query(sql,[customer_id,queue_id]);
  })
  .then(function(result){
    console.log('Joined Queue');
    return client.query(sqlRecord,[queue_id]);
  })
  .then(function(result){
    client.end();
    return result;
  })
  .catch(function(error){
    if(error.code == '23505') {
      console.log('Customer already in queue')
      client.end();
      throw errors.ALREADY_IN_QUEUE;
    }      
    else{
      client.end();
      throw error;
  }
  });

};

function serverAvailable(queue_id){
  const client = new Client(databaseConfig);
  client.connect();

  const sqlSelect = 'SELECT * FROM customer_table where queue_id = lower($1) limit 1';
  const sqlDelete = 'DELETE FROM customer_table where customer_id = $1 AND queue_id = lower($2)';

  return checkQueueIdExist(queue_id)
  .then(function(result){
    if(result.rows[0].status=='inactive'){
      throw errors.INACTIVE_QUEUE;
    };
    return result
  })
  .then(function(result){
    return client.query(sqlSelect,[queue_id])
  })
  .then(function(result){
    const customer = result.rows[0]
    if(customer == undefined) {
      client.end();
      return {'customer_id': 0};
    }
    else{
      return client.query(sqlDelete,[customer.customer_id,customer.queue_id])
      .then(function(result){
        client.end();
        return {'customer_id':parseInt(customer.customer_id)};
      })
    }
  })
  .catch(function(error){
    client.end();
    throw error;
  })
}


function checkQueue(queue_id,customer_id){
  const client = new Client(databaseConfig);
  client.connect();

  const sqlTotal = 'SELECT count(*) FROm customer_table WHERE queue_id = lower($1);';
  const sql = 'select * from customer_table where queue_id = lower($1);';
  const finalResult = {'total':0,'ahead':-1,'status':''}

  return checkQueueIdExist(queue_id)
  .then(function(result){
    finalResult.status = result.rows[0].status.toUpperCase();
  })
  .then(function(){
    return client.query(sqlTotal,[queue_id]);
  })
  .then(function(result){
    finalResult.total = parseInt(result.rows[0].count);
    return client.query(sql,[queue_id]);
  })
  .then(function(result){
    if(isNaN(customer_id)){
      client.end()
      return(finalResult)
    }
    else{
      for(i=0;i<result.rows.length;i++){
        if(result.rows[i].customer_id == customer_id){
          finalResult.ahead = i;
          client.end()
          return(finalResult);
        };
      };
      client.end()
        return(finalResult)
    };
  })
  .catch(function(error){
    client.end();
    throw error;
  })
}


function resetTables() {
  const client = new Client(databaseConfig);
  client.connect();

  const sql = 'DELETE from queue_table; DELETE from customer_table; DELETE from record_table' 

  return client.query(sql)
    .then(function(result){
      client.end();
      console.log('Queue reset successfully')
      return result;
      }
    )
    .catch(function(error){
      client.end();
        throw error; 
    });
}


function closeDatabaseConnections() {
    /**
     * return a promise that resolves when all connection to the database is successfully closed, and rejects if there was any error.
     */
}

module.exports = {
    createQueue,
    updateQueue,
    arrivalRate,
    joinQueue,
    serverAvailable,
    checkQueue,
    resetTables,
    closeDatabaseConnections,
};
