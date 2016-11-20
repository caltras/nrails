#! /usr/bin/env node
Array.prototype.subarray=function(start,end){
     if(!end){ end=-1;} 
    return this.slice(start, this.length+1-(end*-1));
};
console.log("Welcome to NRails cli");

var args = process.argv;
var command = args[2];
var parameters = args.subarray(3);
function findConfig(){
    return require("./config/config");
}
var config = findConfig();

if(command){
    switch(command.toLowerCase()){
        case "init":
        case "i":
            require("./cli/_init")(parameters,config);
            break;
        case "model":
        case "create-domain":
        case "cd":
            require("./cli/_create-domain")(parameters,config);
            break;
        case "create-controller":
        case "cc":
            require("./cli/_create-controller")(parameters,config);
            break;
        case "create-service":
        case "cs":
            require("./cli/_create-service")(parameters,config);
            break;
        case "run":
        case "r":
            require("./cli/_run")(parameters,config);
            break;
        case "test":
        case "t":
            require("./cli/_run-test")(parameters,config);
            break;
        default:
            console.log("Not found command!");
    }
}else{
    console.log("Choose a command to executing!");
}