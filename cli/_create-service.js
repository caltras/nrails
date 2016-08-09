const _ = require("lodash");
var path = process.env.PWD.split("/node_modules");
var fs = require("fs");
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
};
module.exports = function(args) {
    console.log("Create service script");
    if (args.length == 0) {
        console.log("Not found name to service");
        return;
    }
    _.each(args, function(service) {
        var capitalizeService = service.capitalize().replace(/Service/gi,"");
        if (!fs.existsSync(path + "/server/service/" + capitalizeService + "Service.js")) {

            var template = 
`var ${capitalizeService}Service = {
    method : function(){
        return new Promise(function(resolve,reject){
           resolve("Done!") ;
        });
    }
};
module.exports =  ${capitalizeService}Service;`;
            fs.writeFileSync(path + "/server/service/" + capitalizeService + "Service.js", template, "UTF-8");
            console.log(path + "/server/service/" + capitalizeService + "Service.js Created");
        }
    });
};