
const { Client } = require('pg')
var databaseConfig = {
    user: 'gbucvqwv',
    host: 'satao.db.elephantsql.com',
    database: 'gbucvqwv',
    password: 'cm7nKGmJc4HyswI2FR5zJhHWQWiJ5AVY',
    port: 5432,
  }


function createQueue(queue_id,company_id) {
    const client = new Client(databaseConfig)
      client.connect()

      const sql = 'INSERT INTO queue_table VALUES ($1,$2);' 
    
      client 
        .query(sql,[queue_id,company_id])
        .then(function(result){
          console.log('Successful Created New Queue With Queue ID '+queue_id+' and Company ID '+company_id)
          console.log(result)
          }
        )
        .catch(function(error){console.log(error.code);return(error.code)});
}

function updateQueue(queue_id,status) {
    const client = new Client(databaseConfig)
      client.connect()
    if(status=='ACTIVATE') {
       var updatingStatus = 'active';
    }
    else if(status=='DEACTIVATE') {
        var updatingStatus = 'inactive';
    }
    else {
        throw{error:"Status not valid"}
    }
    const sql = "UPDATE queue_table SET status=$1 WHERE queue_id=$2;" 
    client
      .query(sql,[updatingStatus,queue_id])
      .then(function(result){
        if(result.rowCount==1) {
            console.log("Updated Sucessfully")
        }
        else{
            console.log('Queue ID non-existent');
        }
        }
      )
      .catch(function(error){console.log(error)});
}




// function resetTables() {
//     /**
//      * return a promise that resolves when the database is successfully reset, and rejects if there was any error.
//      */
// }

// function closeDatabaseConnections() {
//     /**
//      * return a promise that resolves when all connection to the database is successfully closed, and rejects if there was any error.
//      */
// }

module.exports = {
    createQueue,
    updateQueue,
    // resetTables,
    // closeDatabaseConnections,
};
