var {app}=require('./app.js');
// var port=3000;
var port = process.env.PORT;

var server=app.listen(port,function(){
    console.log("App hosted at localhost:"+port);
});