var {app}=require('./app.js');
var port=3000       ;

var server=app.listen(port,function(){

    console.log("App hosted at localhost:"+port);

    
});